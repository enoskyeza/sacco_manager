import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, TrendingUp, CheckCircle, PiggyBank, Plus, XCircle, Download, Share2, Printer, ChevronDown } from 'lucide-react';
import { useMeeting, useMeetingContributions, useCreateContribution, useUpdateContribution, useDeleteContribution, useFinalizeMeeting } from '../../hooks/useMeetings';
import { toast } from 'sonner';
import { useMembers } from '../../hooks/useMembers';
import { useSacco } from '../../hooks/useSacco';
import { useQuery } from '@tanstack/react-query';
import { passbookApi } from '../../api/passbook';
import { meetingsApi } from '../../api/meetings';
import { formatCurrency, formatDate } from '../../utils/format';
import { downloadMeetingReport, printMeetingReport, shareMeetingReport } from '../../utils/printMeetingReport';
import { Button, Card, CardBody, CardHeader, CardTitle, MeetingStatusBadge, Modal, Input } from '../../components/common';
import { Loading } from '../../components/common/Spinner';
import type { Member } from '../../types';

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentSacco } = useSacco();
  const navigate = useNavigate();
  const meetingId = parseInt(id!);

  const { data: meeting, isLoading: meetingLoading, refetch: refetchMeeting } = useMeeting(meetingId);
  const { data: contributions = [], refetch: refetchContributions } = useMeetingContributions(meetingId);
  const { data: members = [], isLoading: membersLoading } = useMembers({ status: 'active' });
  const { data: sections = [] } = useQuery({
    queryKey: ['sections', currentSacco?.id],
    queryFn: () => passbookApi.getSections(currentSacco!.id),
    enabled: !!currentSacco,
  });
  const { data: meetingEntries = [], refetch: refetchEntries } = useQuery({
    queryKey: ['meeting-entries', meetingId],
    queryFn: () => passbookApi.getMeetingEntries(meetingId),
    enabled: !!meetingId,
  });
  const { data: passbooks = [] } = useQuery({
    queryKey: ['passbooks', currentSacco?.id],
    queryFn: () => passbookApi.getPassbooks(),
    enabled: !!currentSacco,
  });

  // DEBUG: Log initial data
  console.log('=== MEETING DETAIL DEBUG ===');
  console.log('Meeting ID:', meetingId);
  console.log('Meeting Data:', meeting);
  console.log('Contributions:', contributions);
  console.log('Meeting Entries (Extra Payments):', meetingEntries);

  const createContribution = useCreateContribution();
  const updateContribution = useUpdateContribution();
  const deleteContribution = useDeleteContribution();
  const finalizeMeeting = useFinalizeMeeting();

  const [extraModalOpen, setExtraModalOpen] = useState(false);
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [extraAmount, setExtraAmount] = useState('');
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false);

  const isLoading = meetingLoading || membersLoading;
  const weeklyPayment = currentSacco?.cash_round_amount || '51000';

  if (isLoading) {
    return <Loading message="Loading meeting..." />;
  }

  if (!meeting) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Meeting not found</p>
          <Link to="/meetings" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
            Back to Meetings
          </Link>
        </div>
      </div>
    );
  }

  // Handle recording weekly payment
  const handleRecordPayment = async (member: Member) => {
    try {
      const existing = contributions.find(c => c.member === member.id);

      if (existing) {
        // Update existing contribution
        await updateContribution.mutateAsync({
          contributionId: existing.id,
          meetingId,
          data: {
            was_present: true,
            amount_contributed: weeklyPayment,
          },
        });
      } else {
        // Create new contribution
        await createContribution.mutateAsync({
          meeting: meetingId,
          member: member.id,
          was_present: true,
          amount_contributed: weeklyPayment,
          optional_savings: '0',
        });
      }

      await refetchContributions();
      await refetchMeeting(); // Refetch meeting to update totals
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  // Calculate deductions (sum of compulsory sections)
  const calculateDeductions = () => {
    const compulsorySections = sections.filter(s => s.is_compulsory);
    return compulsorySections.reduce((sum, section) => {
      return sum + parseFloat(section.weekly_amount || '0');
    }, 0);
  };

  // Calculate total extra payments from passbook entries (excluding compulsory deductions)
  const calculateExtraPayments = () => {
    // Get compulsory section IDs
    const compulsorySectionIds = sections
      .filter(s => s.is_compulsory)
      .map(s => s.id);
    
    // Sum credit entries that are NOT from compulsory sections (only true extras)
    const total = meetingEntries.reduce((sum, entry) => {
      if (entry.transaction_type === 'credit' && !compulsorySectionIds.includes(entry.section)) {
        return sum + parseFloat(entry.amount || '0');
      }
      return sum;
    }, 0);
    console.log('calculateExtraPayments - Meeting Entries:', meetingEntries.length, 'Extras (non-compulsory):', total);
    return total;
  };

  // Calculate total weekly payments (cash round)
  const calculateWeeklyPayments = () => {
    const total = contributions.reduce((sum, c) => {
      return sum + parseFloat(c.amount_contributed || '0');
    }, 0);
    console.log('calculateWeeklyPayments - Contributions:', contributions.length, 'Total:', total);
    return total;
  };

  // Calculate to bank
  // CRITICAL: After finalization, use backend calculated value (single source of truth)
  // Before finalization, calculate from deductions + extras
  const calculateToBank = () => {
    if (meeting.status === 'completed') {
      // POST-FINALIZATION: Use backend value (already calculated from passbook entries)
      return parseFloat(meeting.amount_to_bank || '0');
    } else {
      // PRE-FINALIZATION: Calculate from sections + extras
      const deductions = calculateDeductions(); // deductions from the recipient
      const extra = calculateExtraPayments();   // any extras already recorded
      return deductions + extra;
    }
  };

  // Handle opening extra modal
  const handleOpenExtraModal = (member: Member) => {
    setSelectedMember(member);
    setExtraAmount('');
    setSelectedSection(null);
    setExtraModalOpen(true);
  };

  // Handle recording extra payment
  const handleRecordExtra = async () => {
    if (!selectedMember || !extraAmount || !selectedSection) return;

    console.log('=== RECORDING EXTRA PAYMENT ===');
    console.log('Selected Member:', selectedMember);
    console.log('Extra Amount:', extraAmount);
    console.log('Selected Section:', selectedSection);
    console.log('Meeting ID:', meetingId);
    console.log('Meeting Week Number:', meeting.week_number);

    try {
      // Get passbook for the member
      const passbooks = await passbookApi.getPassbooks();
      console.log('All Passbooks:', passbooks);
      const memberPassbook = passbooks.find(p => p.member === selectedMember.id);
      console.log('Member Passbook:', memberPassbook);
      
      if (!memberPassbook) {
        console.error('No passbook found for member');
        return;
      }

      // Create passbook entry for the extra payment
      const entryData = {
        passbook: memberPassbook.id,
        section: selectedSection,
        transaction_type: 'credit' as const,
        amount: extraAmount,
        transaction_date: meeting.meeting_date,
        description: `Extra payment - Week ${meeting.week_number}`,
        reference_number: `MTG-${meetingId}-EXTRA-${selectedMember.id}`,
        meeting: meetingId,
        week_number: meeting.week_number,
      };
      console.log('Creating Passbook Entry with data:', entryData);
      
      const createdEntry = await passbookApi.createEntry(entryData);
      console.log('Created Passbook Entry Response:', createdEntry);

      // Refetch contributions to ensure we have the latest data
      await refetchContributions();
      const latestContributions = await meetingsApi.getContributions(meetingId);
      
      // Also update the contribution to track optional savings
      const existing = latestContributions.find((c) => c.member === selectedMember.id);
      if (existing) {
        try {
          await updateContribution.mutateAsync({
            contributionId: existing.id,
            meetingId,
            data: {
              optional_savings: (parseFloat(existing.optional_savings) + parseFloat(extraAmount)).toString(),
            },
          });
        } catch (updateError) {
          // Log error but don't fail - passbook entry is already created
          console.error('Could not update contribution, but passbook entry was created:', updateError);
        }
      } else {
        try {
          await createContribution.mutateAsync({
            meeting: meetingId,
            member: selectedMember.id,
            was_present: true,
            amount_contributed: '0',
            optional_savings: extraAmount,
          });
        } catch (createError) {
          // Log error but don't fail - passbook entry is already created
          console.error('Could not create contribution, but passbook entry was created:', createError);
        }
      }

      console.log('=== REFETCHING DATA ===');
      
      const refetchedContributions = await refetchContributions();
      console.log('Refetched Contributions:', refetchedContributions.data);
      
      const refetchedEntries = await refetchEntries();
      console.log('Refetched Meeting Entries:', refetchedEntries.data);
      
      const refetchedMeeting = await refetchMeeting();
      console.log('Refetched Meeting Data:', refetchedMeeting.data);
      
      console.log('=== UPDATED TOTALS ===');
      console.log('Total Collected:', refetchedMeeting.data?.total_collected);
      console.log('Amount to Bank:', refetchedMeeting.data?.amount_to_bank);
      console.log('Amount to Recipient:', refetchedMeeting.data?.amount_to_recipient);
      
      setExtraModalOpen(false);
      setExtraAmount('');
      setSelectedSection(null);
      setSelectedMember(null);
      toast.success('Extra payment recorded successfully!');
    } catch (error) {
      console.error('=== ERROR RECORDING EXTRA PAYMENT ===');
      console.error('Error details:', error);
      toast.error('Failed to record extra payment');
    }
  };

  // Handle undo payment
  const handleUndoPayment = async (member: Member) => {
    const contribution = getMemberContribution(member.id);
    if (!contribution) return;

    try {
      await deleteContribution.mutateAsync({
        contributionId: contribution.id,
        meetingId,
      });
      await refetchMeeting(); // Refetch meeting to update totals
      toast.success(`Payment for ${member.first_name} ${member.last_name} has been undone`);
    } catch (error) {
      console.error('Error undoing payment:', error);
      toast.error('Failed to undo payment');
    }
  };

  // Handle finalize meeting
  const handleFinalizeMeeting = async () => {
    try {
      await finalizeMeeting.mutateAsync(meetingId);
      setFinalizeModalOpen(false);
      toast.success('Meeting finalized successfully!');
      navigate('/meetings');
    } catch (error) {
      console.error('Error finalizing meeting:', error);
      toast.error('Failed to finalize meeting');
    }
  };

  // Get contribution status for a member
  const getMemberContribution = (memberId: number) => {
    return contributions.find(c => c.member === memberId);
  };

  // Get total extra payments for a member (excluding compulsory deductions)
  const getMemberExtraPayments = (memberId: number) => {
    // Find the member's passbook
    const memberPassbook = passbooks.find((pb) => pb.member === memberId);
    if (!memberPassbook) return 0;
    
    // Get compulsory section IDs
    const compulsorySectionIds = sections
      .filter(s => s.is_compulsory)
      .map(s => s.id);
    
    // Filter entries by this member's passbook
    const memberEntries = meetingEntries.filter(entry => entry.passbook === memberPassbook.id);
    
    // Sum up credit entries that are NOT from compulsory sections (only true extras)
    return memberEntries.reduce((sum, entry) => {
      if (entry.transaction_type === 'credit' && !compulsorySectionIds.includes(entry.section)) {
        return sum + parseFloat(entry.amount || '0');
      }
      return sum;
    }, 0);
  };

  // Build deduction breakdown for report using actual meeting entries
  const buildDeductionBreakdown = () => {
    const breakdown: { sectionName: string; amount: string }[] = [];
    
    // Get recipient's passbook
    const recipientPassbook = passbooks.find(
      pb => pb.member === meeting.cash_round_recipient
    );
    
    if (!recipientPassbook) {
      // Fallback to section amounts if no passbook found
      const compulsorySections = sections.filter(s => s.is_compulsory);
      compulsorySections.forEach(section => {
        breakdown.push({
          sectionName: section.name,
          amount: section.weekly_amount || '0',
        });
      });
      return breakdown;
    }
    
    // Get deduction entries from this meeting for the recipient
    const recipientEntries = meetingEntries.filter(
      entry => entry.passbook === recipientPassbook.id && entry.transaction_type === 'credit'
    );
    
    // Group by section and sum amounts
    const sectionMap = new Map<number, { name: string; amount: number }>();
    
    recipientEntries.forEach(entry => {
      const section = sections.find(s => s.id === entry.section);
      if (section && section.is_compulsory) {
        const existing = sectionMap.get(entry.section);
        if (existing) {
          existing.amount += parseFloat(entry.amount);
        } else {
          sectionMap.set(entry.section, {
            name: section.name,
            amount: parseFloat(entry.amount),
          });
        }
      }
    });
    
    // Convert to breakdown array
    sectionMap.forEach(({ name, amount }) => {
      breakdown.push({
        sectionName: name,
        amount: amount.toString(),
      });
    });
    
    // If no entries found, use section defaults
    if (breakdown.length === 0) {
      const compulsorySections = sections.filter(s => s.is_compulsory);
      compulsorySections.forEach(section => {
        breakdown.push({
          sectionName: section.name,
          amount: section.weekly_amount || '0',
        });
      });
    }
    
    return breakdown;
  };

  // Report handlers
  const handleDownloadReport = async () => {
    try {
      await downloadMeetingReport({
        meeting,
        saccoName: currentSacco?.name || 'SACCO',
        saccoLogo: (currentSacco?.settings as any)?.logo as string | undefined,
        sections,
        deductionBreakdown: buildDeductionBreakdown(),
      });
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const handlePrintReport = async () => {
    try {
      await printMeetingReport({
        meeting,
        saccoName: currentSacco?.name || 'SACCO',
        saccoLogo: (currentSacco?.settings as any)?.logo as string | undefined,
        sections,
        deductionBreakdown: buildDeductionBreakdown(),
      });
    } catch (error) {
      console.error('Error printing report:', error);
      toast.error('Failed to print report');
    }
  };

  const handleShareReport = async () => {
    try {
      await shareMeetingReport(
        {
          meeting,
          saccoName: currentSacco?.name || 'SACCO',
          saccoLogo: (currentSacco?.settings as any)?.logo as string | undefined,
          sections,
          deductionBreakdown: buildDeductionBreakdown(),
        },
        currentSacco?.phone
      );
      toast.success('Report shared successfully!');
    } catch (error) {
      console.error('Error sharing report:', error);
      toast.error('Failed to share report');
    }
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/meetings">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Week {meeting.week_number}, {meeting.year}
            </h1>
            <p className="text-gray-600 mt-1">{formatDate(meeting.meeting_date, 'long')}</p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {meeting.status !== 'completed' ? (
            <Button 
              variant="primary" 
              onClick={() => setFinalizeModalOpen(true)}
              disabled={finalizeMeeting.isPending}
            >
              Finalize Week
            </Button>
          ) : (
            <div className="relative">
              <Button
                variant="primary"
                onClick={() => setReportDropdownOpen(!reportDropdownOpen)}
                rightIcon={<ChevronDown size={16} />}
              >
                Week Report
              </Button>
              
              {reportDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setReportDropdownOpen(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="menu">
                      <button
                        onClick={() => {
                          handleDownloadReport();
                          setReportDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Download size={16} />
                        Download Report
                      </button>
                      
                      <button
                        onClick={() => {
                          handleShareReport();
                          setReportDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Share2 size={16} />
                        Share Report
                      </button>
                      
                      <button
                        onClick={() => {
                          handlePrintReport();
                          setReportDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Printer size={16} />
                        Print Report
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <MeetingStatusBadge status={meeting.status} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <DollarSign className="text-indigo-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Collected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(meeting.total_collected || '0')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Cash Round Contributions
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <TrendingUp className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Deductions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {meeting.status === 'completed' 
                    ? formatCurrency(meeting.total_deductions || '0')
                    : formatCurrency(calculateDeductions().toString())
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  From Recipient
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">To Member</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(meeting.amount_to_recipient || '0')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Cash Round - Deductions
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">To Bank</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(calculateToBank().toString())}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Deductions + Extra
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Cash Round Recipient */}
      {meeting.cash_round_recipient_name && (
        <Card>
          <CardHeader>
            <CardTitle>Cash Round</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recipient</p>
                <p className="text-lg font-semibold text-gray-900">
                  {meeting.cash_round_recipient_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(meeting.amount_to_recipient)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Members Collection Table */}
      <Card>
        <CardHeader>
          <CardTitle>Member Collections</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weekly Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => {
                  const contribution = getMemberContribution(member.id);
                  const hasPaid = contribution && parseFloat(contribution.amount_contributed) > 0;
                  const extraPayments = getMemberExtraPayments(member.id);
                  const hasSavings = extraPayments > 0;
                  const isRecipient = meeting.cash_round_recipient === member.id;

                  return (
                    <tr key={member.id} className={`${isRecipient ? 'bg-indigo-50 border-l-4 border-l-yellow-500' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {member.profile_picture ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={member.profile_picture}
                                alt={`${member.first_name} ${member.last_name}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                                {member.first_name?.[0] || '?'}{member.last_name?.[0] || ''}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {member.first_name} {member.last_name}
                              {isRecipient && (
                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                  Recipient
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              #{member.member_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contribution?.amount_contributed 
                            ? formatCurrency(contribution.amount_contributed)
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {extraPayments > 0
                            ? formatCurrency(extraPayments.toString())
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {hasPaid && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle size={12} className="mr-1" /> Paid
                            </span>
                          )}
                          {hasSavings && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              <PiggyBank size={12} className="mr-1" /> Savings
                            </span>
                          )}
                          {!hasPaid && !hasSavings && (
                            <span className="text-xs text-gray-500">Pending</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {hasPaid ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUndoPayment(member)}
                              disabled={meeting.status === 'completed' || deleteContribution.isPending}
                              leftIcon={<XCircle size={14} />}
                            >
                              Undo
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleRecordPayment(member)}
                              disabled={meeting.status === 'completed' || createContribution.isPending || updateContribution.isPending}
                            >
                              Pay
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenExtraModal(member)}
                            leftIcon={<Plus size={14} />}
                            disabled={meeting.status === 'completed'}
                          >
                            {hasSavings ? 'Update' : 'Extra'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {members.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No active members found
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Passbook Entries for this Meeting - Only non-compulsory (true extras) */}
      {meetingEntries.filter(entry => {
        const compulsorySectionIds = sections.filter(s => s.is_compulsory).map(s => s.id);
        return !compulsorySectionIds.includes(entry.section);
      }).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Extra Payments ({meetingEntries.filter(entry => {
                const compulsorySectionIds = sections.filter(s => s.is_compulsory).map(s => s.id);
                return !compulsorySectionIds.includes(entry.section);
              }).length})
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {meetingEntries
                .filter(entry => {
                  const compulsorySectionIds = sections.filter(s => s.is_compulsory).map(s => s.id);
                  return !compulsorySectionIds.includes(entry.section);
                })
                .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {entry.member_name?.[0] || 'M'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{entry.member_name}</p>
                      <p className="text-sm text-gray-600">{entry.section_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      +{formatCurrency(entry.amount)}
                    </p>
                    <p className="text-xs text-gray-500">Extra</p>
                  </div>
                </div>
                ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Contributions ({contributions.length})</CardTitle>
        </CardHeader>
        <CardBody>
          {contributions.length > 0 ? (
            <div className="space-y-3">
              {contributions.map((contribution) => {
                const hasPaid = parseFloat(contribution.amount_contributed) > 0;
                const hasSavings = parseFloat(contribution.optional_savings) > 0;

                return (
                  <div
                    key={contribution.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {contribution.member_name?.[0] || 'M'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{contribution.member_name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {hasPaid && (
                            <span className="text-sm text-gray-600">
                              Weekly: {formatCurrency(contribution.amount_contributed)}
                            </span>
                          )}
                          {hasSavings && (
                            <span className="text-sm text-blue-600">
                              Savings: {formatCurrency(contribution.optional_savings)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(contribution.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(
                          (parseFloat(contribution.amount_contributed) + 
                           parseFloat(contribution.optional_savings)).toString()
                        )}
                      </p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No transactions recorded yet</p>
          )}
        </CardBody>
      </Card>

      {/* Notes */}
      {meeting.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-gray-700">{meeting.notes}</p>
          </CardBody>
        </Card>
      )}

      {/* Extra Payment Modal */}
      <Modal
        isOpen={extraModalOpen}
        onClose={() => {
          setExtraModalOpen(false);
          setSelectedMember(null);
          setExtraAmount('');
          setSelectedSection(null);
        }}
        title="Record Extra Payment"
      >
        <div className="space-y-4">
          {selectedMember && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Member</p>
              <p className="font-medium text-gray-900">
                {selectedMember.first_name} {selectedMember.last_name}
              </p>
              <p className="text-sm text-gray-500">#{selectedMember.member_number}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Section
            </label>
            <select
              value={selectedSection || ''}
              onChange={(e) => setSelectedSection(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose a section...</option>
              {sections
                .filter(section => !section.is_compulsory)
                .map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name} {section.weekly_amount && `(Default: ${formatCurrency(section.weekly_amount)})`}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Only non-compulsory sections are shown
            </p>
          </div>

          <Input
            label="Amount"
            type="number"
            value={extraAmount}
            onChange={(e) => setExtraAmount(e.target.value)}
            placeholder="Enter amount (UGX)"
            leftIcon={<Plus size={18} />}
            min="0"
            step="1000"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setExtraModalOpen(false);
                setSelectedMember(null);
                setExtraAmount('');
                setSelectedSection(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRecordExtra}
              isLoading={createContribution.isPending || updateContribution.isPending}
              disabled={!extraAmount || parseFloat(extraAmount) <= 0 || !selectedSection}
            >
              Record Extra
            </Button>
          </div>
        </div>
      </Modal>

      {/* Finalize Week Confirmation Modal */}
      <Modal
        isOpen={finalizeModalOpen}
        onClose={() => setFinalizeModalOpen(false)}
        title="Finalize Week"
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Finalizing this week will:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
              <li>Create passbook entries for all contributions</li>
              <li>Mark the week as completed</li>
              <li>Advance the cash round to the next member</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Collected:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency((calculateWeeklyPayments() + calculateExtraPayments()).toString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Members Contributed:</span>
                <span className="font-semibold text-gray-900">{contributions.length}</span>
              </div>
              {meeting.cash_round_recipient_name && (
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-semibold text-gray-900">{meeting.cash_round_recipient_name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setFinalizeModalOpen(false)}
              disabled={finalizeMeeting.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleFinalizeMeeting}
              isLoading={finalizeMeeting.isPending}
            >
              Yes, Finalize Week
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

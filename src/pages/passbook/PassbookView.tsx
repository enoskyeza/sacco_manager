import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { passbookApi } from '../../api';
import { useSacco } from '../../hooks/useSacco';
import { Loading } from '../../components/common/Spinner';
import { Button, Card, CardBody, CardHeader, CardTitle } from '../../components/common';
import SectionTabs from '../../components/passbook/SectionTabs';
import TransactionList from '../../components/passbook/TransactionList';
import BalanceCard from '../../components/passbook/BalanceCard';
import { formatCurrency } from '../../utils/format';

export default function PassbookView() {
  const { id } = useParams<{ id: string }>();
  const { currentSacco } = useSacco();
  const [activeSection, setActiveSection] = useState<number | null>(null);

  // Fetch passbook statement
  const { data: statement, isLoading } = useQuery({
    queryKey: ['passbook-statement', id],
    queryFn: () => passbookApi.getPassbookStatement(parseInt(id!)),
    enabled: !!id,
  });

  // Fetch sections
  const { data: sections = [] } = useQuery({
    queryKey: ['sections', currentSacco?.id],
    queryFn: () => passbookApi.getSections(currentSacco!.id),
    enabled: !!currentSacco,
  });

  // Set default active section
  if (statement && sections.length > 0 && activeSection === null) {
    setActiveSection(sections[0].id);
  }

  const activeStatementSection = statement?.sections.find(
    (s) => s.section_id === activeSection
  );

  const activeSectionData = sections.find((s) => s.id === activeSection);

  if (isLoading) {
    return <Loading message="Loading passbook..." />;
  }

  if (!statement) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Passbook not found</p>
          <Link to="/members" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
            Back to Members
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to={`/members/${statement.passbook.member_number}`}>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {statement.passbook.member_name}'s Passbook
            </h1>
            <p className="text-gray-600 mt-1">
              Passbook #{statement.passbook.passbook_number} • Member #{statement.passbook.member_number}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Filter size={18} />}>
            Filter
          </Button>
          <Button variant="outline" leftIcon={<Download size={18} />}>
            Export
          </Button>
        </div>
      </div>

      {/* Total Balance */}
      <Card>
        <CardBody>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-2">Total Balance</p>
            <p className="text-4xl font-bold text-gray-900">
              {formatCurrency(statement.total_balance)}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Section Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statement.sections.map((section) => (
          <BalanceCard
            key={section.section_id}
            balance={section.current_balance}
            sectionName={section.section}
            sectionColor={section.color}
            isCompulsory={sections.find((s) => s.id === section.section_id)?.is_compulsory}
          />
        ))}
      </div>

      {/* Transactions by Section */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <div>
          <SectionTabs
            sections={sections}
            activeSection={activeSection || sections[0]?.id}
            onSectionChange={setActiveSection}
          />
        </div>
        <CardBody>
          {activeStatementSection && activeSectionData ? (
            <TransactionList
              entries={activeStatementSection.entries}
              sectionColor={activeSectionData.color}
            />
          ) : (
            <p className="text-center text-gray-500 py-8">Select a section to view transactions</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

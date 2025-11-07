import { useEffect, useState } from 'react';
import { ChevronDown, Calendar, Users, DollarSign } from 'lucide-react';
import { useSacco } from '../../hooks/useSacco';
import { cashRoundApi } from '../../api/cashRound';
import type { CashRound } from '../../api/cashRound';
import { toast } from 'sonner';

interface CashRoundSelectorProps {
  onRoundSelect: (round: CashRound | null) => void;
  selectedRoundId?: number;
  onLoadingChange?: (loading: boolean) => void;
}

export default function CashRoundSelector({ onRoundSelect, selectedRoundId, onLoadingChange }: CashRoundSelectorProps) {
  const { currentSacco } = useSacco();
  const [cashRounds, setCashRounds] = useState<CashRound[]>([]);
  const [selectedRound, setSelectedRound] = useState<CashRound | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentSacco?.id) return;

    let isMounted = true;

    const loadRounds = async () => {
      try {
        setIsLoading(true);
        onLoadingChange?.(true);
        const rounds = await cashRoundApi.getActiveCashRounds(currentSacco.id);
        
        if (!isMounted) return;
        
        setCashRounds(rounds);

        // Auto-select if only one round
        if (rounds.length === 1) {
          setSelectedRound(rounds[0]);
          onRoundSelect(rounds[0]);
        } else if (rounds.length > 0 && !selectedRoundId) {
          // Select first round by default
          setSelectedRound(rounds[0]);
          onRoundSelect(rounds[0]);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load cash rounds:', error);
        toast.error('Failed to load cash rounds');
      } finally {
        if (isMounted) {
          setIsLoading(false);
          onLoadingChange?.(false);
        }
      }
    };

    loadRounds();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSacco?.id]);

  useEffect(() => {
    if (selectedRoundId && cashRounds.length > 0 && selectedRound?.id !== selectedRoundId) {
      const round = cashRounds.find(r => r.id === selectedRoundId);
      if (round) {
        setSelectedRound(round);
        onRoundSelect(round);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoundId, cashRounds]);

  const handleRoundSelect = (round: CashRound) => {
    setSelectedRound(round);
    onRoundSelect(round);
    setIsOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (cashRounds.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Active Cash Rounds</h3>
        <p className="text-sm text-gray-500 mb-4">
          Create a cash round in settings to get started
        </p>
      </div>
    );
  }

  // Single round - show as heading (no dropdown)
  if (cashRounds.length === 1) {
    const round = cashRounds[0];
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-900">{round.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(round.status)}`}>
                {getStatusLabel(round.status)}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(round.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{round.member_count} members</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>UGX {parseFloat(round.weekly_amount).toLocaleString()}/week</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multiple rounds - show dropdown
  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          {selectedRound ? (
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-gray-900">{selectedRound.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRound.status)}`}>
                  {getStatusLabel(selectedRound.status)}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(selectedRound.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{selectedRound.member_count} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>UGX {parseFloat(selectedRound.weekly_amount).toLocaleString()}/week</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Select a cash round</div>
          )}
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-auto">
            {cashRounds.map((round) => (
              <button
                key={round.id}
                onClick={() => handleRoundSelect(round)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  selectedRound?.id === round.id ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{round.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(round.status)}`}>
                    {getStatusLabel(round.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(round.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{round.member_count} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>UGX {parseFloat(round.weekly_amount).toLocaleString()}/week</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

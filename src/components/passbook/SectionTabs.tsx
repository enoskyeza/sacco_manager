import type { PassbookSection } from '../../types';

interface SectionTabsProps {
  sections: PassbookSection[];
  activeSection: number;
  onSectionChange: (sectionId: number) => void;
}

export default function SectionTabs({ sections, activeSection, onSectionChange }: SectionTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Passbook sections">
        {sections.map((section) => {
          const isActive = section.id === activeSection;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`
                whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm
                transition-colors
                ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              style={
                isActive
                  ? {
                      borderBottomColor: section.color,
                      color: section.color,
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: section.color }}
                />
                <span>{section.name}</span>
                {section.is_compulsory && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    Required
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

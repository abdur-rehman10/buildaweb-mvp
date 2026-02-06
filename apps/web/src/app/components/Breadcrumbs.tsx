import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  icon?: React.ElementType;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  paths?: Array<{ label: string; href?: string }>; // Support legacy paths prop
  showHome?: boolean;
  onNavigate?: (screen: string) => void;
}

export function Breadcrumbs({ items, paths, showHome = true, onNavigate }: BreadcrumbsProps) {
  // Convert paths to items if paths is provided
  const breadcrumbItems: BreadcrumbItem[] = items || (paths || []).map(path => ({
    label: path.label,
    onClick: path.href && onNavigate ? () => onNavigate(path.href!) : undefined,
  }));

  // Safety check - ensure we have items
  if (!breadcrumbItems || breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {showHome && breadcrumbItems[0]?.onClick && (
        <>
          <button
            onClick={breadcrumbItems[0].onClick}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </button>
          {breadcrumbItems.length > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </>
      )}
      
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const Icon = item.icon;
        
        return (
          <div key={index} className="flex items-center gap-2">
            {item.onClick && !isLast ? (
              <button
                onClick={item.onClick}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </button>
            ) : (
              <span 
                className={`flex items-center gap-1 ${
                  isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </span>
            )}
            
            {!isLast && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
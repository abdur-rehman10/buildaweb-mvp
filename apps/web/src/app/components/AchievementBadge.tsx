import { useState, useEffect } from 'react';
import { Card } from './Card';
import { 
  Trophy, 
  Award, 
  Star, 
  Zap, 
  Target, 
  Rocket,
  CheckCircle,
  Lock,
  X
} from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'award' | 'star' | 'zap' | 'target' | 'rocket';
  category: 'getting-started' | 'content' | 'design' | 'launch' | 'growth';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  total?: number;
}

interface AchievementBadgeProps {
  achievements: Achievement[];
  showUnlocked?: boolean;
  onClose?: () => void;
}

export function AchievementBadge({ achievements, showUnlocked = false, onClose }: AchievementBadgeProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    // Show notification for newly unlocked achievements
    const recent = achievements.find(
      (a) => a.unlocked && a.unlockedAt && Date.now() - a.unlockedAt.getTime() < 3000
    );
    if (recent && showUnlocked) {
      setNewAchievement(recent);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [achievements, showUnlocked]);

  const getIcon = (iconName: Achievement['icon']) => {
    const icons = {
      trophy: Trophy,
      award: Award,
      star: Star,
      zap: Zap,
      target: Target,
      rocket: Rocket,
    };
    return icons[iconName];
  };

  const getCategoryColor = (category: Achievement['category']) => {
    const colors = {
      'getting-started': 'from-blue-500 to-cyan-500',
      'content': 'from-purple-500 to-pink-500',
      'design': 'from-yellow-500 to-orange-500',
      'launch': 'from-green-500 to-emerald-500',
      'growth': 'from-red-500 to-rose-500',
    };
    return colors[category];
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <>
      {/* Achievement Notification */}
      {showNotification && newAchievement && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
          <Card className="p-4 max-w-sm bg-gradient-to-br from-primary/5 to-cyan-500/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div
                className={`h-12 w-12 rounded-full bg-gradient-to-br ${getCategoryColor(
                  newAchievement.category
                )} flex items-center justify-center flex-shrink-0`}
              >
                {(() => {
                  const Icon = getIcon(newAchievement.icon);
                  return <Icon className="h-6 w-6 text-white" />;
                })()}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-primary mb-1">Achievement Unlocked! 🎉</p>
                <h4 className="font-bold mb-1">{newAchievement.title}</h4>
                <p className="text-sm text-muted-foreground">{newAchievement.description}</p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Achievements Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Achievements</h3>
            <p className="text-sm text-muted-foreground">
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => {
            const Icon = getIcon(achievement.icon);
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-border bg-muted/30 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      achievement.unlocked
                        ? `bg-gradient-to-br ${getCategoryColor(achievement.category)}`
                        : 'bg-muted'
                    }`}
                  >
                    {achievement.unlocked ? (
                      <Icon className="h-5 w-5 text-white" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  {achievement.unlocked && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                </div>
                <h4 className="font-bold text-sm mb-1">{achievement.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {achievement.description}
                </p>
                {!achievement.unlocked && achievement.progress !== undefined && achievement.total !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {achievement.progress}/{achievement.total}
                      </span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

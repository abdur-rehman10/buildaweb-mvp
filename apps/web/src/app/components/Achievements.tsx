import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { X, Trophy, Zap, Target, Users, Rocket, Star, Award } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  color: string;
  progress: number;
  total: number;
  unlocked: boolean;
  xp: number;
}

interface AchievementsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Achievements({ isOpen, onClose }: AchievementsProps) {
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Create your first project',
      icon: Rocket,
      color: 'from-blue-500 to-cyan-500',
      progress: 1,
      total: 1,
      unlocked: true,
      xp: 100,
    },
    {
      id: '2',
      title: 'Designer',
      description: 'Customize 10 components',
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      progress: 3,
      total: 10,
      unlocked: false,
      xp: 250,
    },
    {
      id: '3',
      title: 'Publisher',
      description: 'Publish your first site',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      progress: 0,
      total: 1,
      unlocked: false,
      xp: 500,
    },
    {
      id: '4',
      title: 'Team Player',
      description: 'Invite 3 team members',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      progress: 0,
      total: 3,
      unlocked: false,
      xp: 300,
    },
    {
      id: '5',
      title: 'Popular',
      description: 'Get 1,000 site views',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      progress: 245,
      total: 1000,
      unlocked: false,
      xp: 1000,
    },
    {
      id: '6',
      title: 'Master Builder',
      description: 'Create 5 published sites',
      icon: Award,
      color: 'from-indigo-500 to-purple-500',
      progress: 1,
      total: 5,
      unlocked: false,
      xp: 2000,
    },
  ]);

  const totalXP = achievements.reduce((sum, a) => sum + (a.unlocked ? a.xp : 0), 0);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Achievements</h2>
              <p className="text-sm text-muted-foreground">
                {unlockedCount} of {achievements.length} unlocked • {totalXP} XP earned
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Level 3 Builder</span>
              <span className="text-sm text-muted-foreground">{totalXP} / 5000 XP</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-cyan-500"
                style={{ width: `${(totalXP / 5000) * 100}%` }}
              />
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={`p-6 rounded-lg border-2 ${
                    achievement.unlocked
                      ? 'border-primary bg-primary/5'
                      : 'border-border opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${achievement.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.unlocked ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Unlocked! +{achievement.xp} XP</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {achievement.progress} / {achievement.total}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-cyan-500"
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
      </Card>
    </div>
  );
}

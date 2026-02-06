import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  MessageSquare, 
  Send,
  Check,
  X,
  MoreVertical,
  AtSign,
  Paperclip,
  Smile,
  Filter
} from 'lucide-react';

interface CommentsProps {
  projectId: string;
  onBack: () => void;
}

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: 'owner' | 'admin' | 'editor';
  };
  content: string;
  timestamp: string;
  section: string;
  page: string;
  resolved: boolean;
  replies: {
    id: string;
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    timestamp: string;
  }[];
}

export function Comments({ projectId, onBack }: CommentsProps) {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: {
        name: 'Sarah Johnson',
        avatar: 'SJ',
        role: 'admin',
      },
      content: 'The hero section looks great! Can we try making the heading a bit larger?',
      timestamp: '2 hours ago',
      section: 'Hero',
      page: 'Home',
      resolved: false,
      replies: [
        {
          id: '1-1',
          author: {
            name: 'You',
            avatar: 'JD',
          },
          content: 'Good idea! I\'ll increase it to 4xl. Let me know what you think.',
          timestamp: '1 hour ago',
        },
      ],
    },
    {
      id: '2',
      author: {
        name: 'Mike Chen',
        avatar: 'MC',
        role: 'editor',
      },
      content: 'Should we add a newsletter signup in the footer?',
      timestamp: '1 day ago',
      section: 'Footer',
      page: 'Home',
      resolved: false,
      replies: [],
    },
    {
      id: '3',
      author: {
        name: 'You',
        avatar: 'JD',
        role: 'owner',
      },
      content: 'Updated the color scheme as discussed. Ready for review!',
      timestamp: '2 days ago',
      section: 'Global Styles',
      page: 'All Pages',
      resolved: true,
      replies: [
        {
          id: '3-1',
          author: {
            name: 'Sarah Johnson',
            avatar: 'SJ',
          },
          content: 'Perfect! Looks much better now.',
          timestamp: '2 days ago',
        },
      ],
    },
  ]);

  const filteredComments = comments.filter((comment) => {
    if (filter === 'unresolved') return !comment.resolved;
    if (filter === 'resolved') return comment.resolved;
    return true;
  });

  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        avatar: 'JD',
        role: 'owner',
      },
      content: newComment,
      timestamp: 'Just now',
      section: 'General',
      page: 'Home',
      resolved: false,
      replies: [],
    };

    setComments([comment, ...comments]);
    setNewComment('');
    toast.success('Comment added');
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;

    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [
                ...comment.replies,
                {
                  id: `${commentId}-${Date.now()}`,
                  author: {
                    name: 'You',
                    avatar: 'JD',
                  },
                  content: replyText,
                  timestamp: 'Just now',
                },
              ],
            }
          : comment
      )
    );

    setReplyText('');
    setReplyingTo(null);
    toast.success('Reply added');
  };

  const handleResolve = (commentId: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, resolved: true } : comment
      )
    );
    toast.success('Comment marked as resolved');
  };

  const handleUnresolve = (commentId: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, resolved: false } : comment
      )
    );
    toast.success('Comment reopened');
  };

  const handleDelete = (commentId: string) => {
    setComments(comments.filter((comment) => comment.id !== commentId));
    toast.success('Comment deleted');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'editor':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </button>
          <Logo size="sm" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Comments & Feedback</h1>
            <p className="text-muted-foreground">
              Collaborate with your team • {unresolvedCount} unresolved
            </p>
          </div>
        </div>

        {/* New Comment */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                JD
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a comment or feedback..."
                  className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <AtSign className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4" />
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'unresolved', label: `Unresolved (${unresolvedCount})` },
              { value: 'resolved', label: 'Resolved' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as any)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  filter === option.value
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border hover:bg-accent'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <Card
              key={comment.id}
              className={comment.resolved ? 'opacity-60' : ''}
            >
              <div className="p-6">
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                      {comment.author.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{comment.author.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(
                            comment.author.role
                          )}`}
                        >
                          {comment.author.role}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {comment.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{comment.page}</span>
                        <span>•</span>
                        <span>{comment.section}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="ml-13 mb-4">
                  <p className={comment.resolved ? 'line-through' : ''}>
                    {comment.content}
                  </p>
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="ml-13 space-y-4 mb-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {reply.author.avatar}
                        </div>
                        <div className="flex-1 bg-muted rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {reply.author.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {reply.timestamp}
                            </span>
                          </div>
                          <p className="text-sm">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === comment.id && (
                  <div className="ml-13 mb-4">
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        JD
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full min-h-[60px] px-3 py-2 rounded-md border border-input bg-background resize-none text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddReply(comment.id)}
                            disabled={!replyText.trim()}
                          >
                            <Send className="h-3 w-3" />
                            Reply
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="ml-13 flex items-center gap-2">
                  {!comment.resolved ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResolve(comment.id)}
                      >
                        <Check className="h-4 w-4" />
                        Resolve
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnresolve(comment.id)}
                    >
                      <X className="h-4 w-4" />
                      Reopen
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(comment.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredComments.length === 0 && (
          <Card className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">No comments yet</h3>
            <p className="text-muted-foreground">
              {filter === 'unresolved'
                ? 'All comments have been resolved!'
                : 'Start a conversation with your team'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

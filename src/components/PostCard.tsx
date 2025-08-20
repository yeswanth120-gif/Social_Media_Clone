import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

interface Post {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  likes_count: number;
}

interface PostCardProps {
  post: Post;
  onPostDeleted: () => void;
  onPostUpdated: () => void;
}

export const PostCard = ({ post, onPostDeleted, onPostUpdated }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleLike = async () => {
    try {
      if (isLiked) {
        // Unlike - remove like
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("author_name", "You");

        if (error) throw error;
        setIsLiked(false);
      } else {
        // Like - add like
        const { error } = await supabase
          .from("likes")
          .insert([
            {
              post_id: post.id,
              author_name: "You",
            },
          ]);

        if (error) throw error;
        setIsLiked(true);
      }
      onPostUpdated();
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;

      onPostDeleted();
      toast({
        title: "Post deleted",
        description: "The post has been removed successfully.",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {post.author_name[0]?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm">{post.author_name}</h4>
                <p className="text-xs text-muted-foreground">
                  {formatDate(post.created_at)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{post.content}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4 px-6">
        <div className="flex items-center space-x-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-xs">{post.likes_count}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-muted-foreground hover:text-blue-500"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">Comment</span>
          </Button>
        </div>
        {showComments && (
          <div className="mt-4 w-full border-t pt-4">
            <CommentForm postId={post.id} onCommentAdded={onPostUpdated} />
            <CommentList postId={post.id} />
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
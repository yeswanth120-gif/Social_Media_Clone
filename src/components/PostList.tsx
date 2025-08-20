import { useEffect, useState } from "react";
import { PostCard } from "./PostCard";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  likes_count: number;
}

interface PostListProps {
  refreshTrigger: number;
}

export const PostList = ({ refreshTrigger }: PostListProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onPostDeleted={fetchPosts}
          onPostUpdated={fetchPosts}
        />
      ))}
    </div>
  );
};
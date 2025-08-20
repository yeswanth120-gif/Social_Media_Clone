import { useState } from "react";
import { PostForm } from "@/components/PostForm";
import { PostList } from "@/components/PostList";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Social Feed</h1>
          <p className="text-muted-foreground">Share your thoughts with the world</p>
        </header>
        
        <PostForm onPostCreated={handlePostCreated} />
        <PostList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default Index;

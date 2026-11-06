import React from 'react';
import { Post, Category, ActiveNav } from '../../types';
import { ArticlesManagement } from './ArticlesManagement';

interface NewsManagementProps {
  posts: Post[];
  categories: Category[];
  onNavigate: (nav: ActiveNav, postIdOrSlug?: string) => void;
}

export const NewsManagement: React.FC<NewsManagementProps> = ({
  posts,
  categories,
  onNavigate,
}) => {
  return (
    <ArticlesManagement
      posts={posts}
      categories={categories}
      onNavigate={onNavigate}
      postTypeFilter="NEWS"
    />
  );
};

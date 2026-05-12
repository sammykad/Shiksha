export interface BlogImage {
    src: string;
    alt: string;
    caption?: string;
}

export interface BlogAuthor {
    name: string;
    role: string;
    avatar: string;
}

export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    excerpt: string;
    date: string;          // ISO format: 'YYYY-MM-DD'
    updatedAt?: string;
    category: string;
    tags: string[];
    readTime: string;      // e.g. '5 min read'
    featured: boolean;
    views: string;         // display string, e.g. '4.1K'
    coverImage: BlogImage;
    author: BlogAuthor;
    content: {
        introduction: string;
        stats?: { value: string; label: string }[];
        sections: {
            title: string;
            content: string;
            image?: BlogImage;
            highlights?: string[];
        }[];
        conclusion: string;
    };
}
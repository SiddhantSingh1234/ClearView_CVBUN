import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart, MessageSquare, Video, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const Usage = () => {
  const { userData } = useAuth();

  if (!userData) {
    return (
      // <div className="flex justify-center items-center h-64">
      //   <p className="text-lg text-muted-foreground">Please sign in to view your usage statistics.</p>
      // </div>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-2">
          <Users className="text-primary" /> Your Usage
        </h1>
        <div className="bg-card rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-3">Track and Optimize your Usage</h2>
          <p className="text-primary mb-4">Sign in to get your usage.</p>
          <div className="flex justify-center space-x-4">
            <a href="/login" className="bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90">Sign In</a>
            <a href="/signup" className="border border-primary text-primary py-2 px-4 rounded-md font-medium hover:bg-primary/10">Create Account</a>
          </div>
        </div>
      </div>
    );
  }

  const { likedArticles, likedVideos, comments } = userData;

  const stats = {
    totalArticlesRead: likedArticles.length || 0,
    totalVideosLiked: likedVideos.length || 0,
    totalComments: comments.length || 0
  };

  const data = [
    { name: 'Articles Liked', value: stats.totalArticlesRead },
    { name: 'Videos Liked', value: stats.totalVideosLiked },
    { name: 'Comments', value: stats.totalComments }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-2">
        <Users className="text-primary" /> Your Usage
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[{
          label: 'Articles Liked',
          value: stats.totalArticlesRead,
          icon: <Heart className="text-primary" />
        }, {
          label: 'Comments',
          value: stats.totalComments,
          icon: <MessageSquare className="text-primary" />
        }, {
          label: 'Videos Liked',
          value: stats.totalVideosLiked,
          icon: <Video className="text-primary" />
        }].map((stat, index) => (
          <Card key={index} className="hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 rounded-full bg-muted text-primary">
                {stat.icon}
              </div>
              <div>
                <p className="text-lg font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-semibold text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-foreground">Activity Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" />
            <YAxis stroke="currentColor" className="text-muted-foreground" />
            <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} contentStyle={{ backgroundColor: '#1e293b', color: '#f8fafc', borderRadius: '6px', padding: '8px' }} itemStyle={{ color: '#f8fafc' }} />
            <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Usage;

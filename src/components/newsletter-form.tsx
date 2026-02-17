'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      // In a real app, you would handle the form submission here (e.g., API call)
      console.log('Newsletter subscription for:', email);
      setIsSubscribed(true);
      setEmail('');
    }
  };

  useEffect(() => {
    if (isSubscribed) {
      const timer = setTimeout(() => {
        setIsSubscribed(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSubscribed]);

  if (isSubscribed) {
    return (
      <div className="flex h-10 w-full max-w-sm items-center space-x-2 rounded-md border border-accent/50 bg-accent/10 px-3 text-accent">
        <CheckCircle className="h-5 w-5" />
        <p className="text-sm font-medium">Thank you for subscribing!</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm items-center space-x-2"
    >
      <div className="relative flex-grow">
        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10"
          required
          aria-label="Email for newsletter"
        />
      </div>
      <Button type="submit" variant="default" className="font-bold">
        Subscribe
      </Button>
    </form>
  );
}

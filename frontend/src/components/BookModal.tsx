import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, BookOpen } from 'lucide-react';
import { useMedia } from '@/contexts/MediaContext';
import { toast } from '@/hooks/use-toast';
import type { Book } from 'bookmarked-types';

// Form validation schema
const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  author: z.string().optional(),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
  status: z.enum(['read', 'reading', 'will read']),
  rating: z.number().min(1).max(10).optional(),
  review: z.string().max(2000, 'Review too long').optional(),
  completedOn: z.string().optional(),
  coverUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type BookFormData = z.infer<typeof bookSchema>;

interface BookModalProps {
  book?: Book;
  isEdit?: boolean;
  trigger?: React.ReactNode;
}

export default function BookModal({ book, isEdit = false, trigger }: BookModalProps) {
  const [open, setOpen] = useState(false);
  const [genres, setGenres] = useState<string[]>(book?.genres || []);
  const [newGenre, setNewGenre] = useState('');
  const { addBook, updateBook } = useMedia();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book?.title || '',
      author: book?.author || '',
      genres: book?.genres || [],
      status: book?.status || 'will read',
      rating: book?.rating || undefined,
      review: book?.review || '',
      completedOn: book?.completedOn ? new Date(book.completedOn).toISOString().split('T')[0] : '',
      coverUrl: book?.coverUrl || '',
    },
  });

  // Update genres in form when local state changes
  useEffect(() => {
    setValue('genres', genres);
  }, [genres, setValue]);

  const onSubmit = async (data: BookFormData) => {
    try {
      const bookData = {
        ...data,
        genres,
        completedOn: data.completedOn ? new Date(data.completedOn) : undefined,
        rating: data.rating || undefined,
        coverUrl: data.coverUrl || undefined,
      };

      if (isEdit && book) {
        await updateBook(book._id, bookData);
        toast({
          title: 'Success',
          description: 'Book updated successfully!',
        });
      } else {
        await addBook(bookData);
        toast({
          title: 'Success',
          description: 'Book added successfully!',
        });
      }

      setOpen(false);
      reset();
      setGenres([]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const addGenre = () => {
    if (newGenre.trim() && !genres.includes(newGenre.trim()) && genres.length < 10) {
      setGenres([...genres, newGenre.trim()]);
      setNewGenre('');
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setGenres(genres.filter(genre => genre !== genreToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGenre();
    }
  };

  const defaultTrigger = (
    <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
      <BookOpen className="w-4 h-4 mr-2" />
      Add Book
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {isEdit ? 'Edit Book' : 'Add New Book'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter book title"
              className="focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              {...register('author')}
              placeholder="Enter author name"
              className="focus:ring-2 focus:ring-blue-500"
            />
            {errors.author && (
              <p className="text-sm text-red-600">{errors.author.message}</p>
            )}
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <Label>Genres *</Label>
            <div className="flex gap-2">
              <Input
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a genre"
                className="focus:ring-2 focus:ring-blue-500"
              />
              <Button type="button" onClick={addGenre} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {genres.map((genre, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {genre}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeGenre(genre)}
                  />
                </Badge>
              ))}
            </div>
            {errors.genres && (
              <p className="text-sm text-red-600">{errors.genres.message}</p>
            )}
          </div>

          {/* Status and Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="will read">Will Read</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-10)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="10"
                step="0.5"
                {...register('rating', { valueAsNumber: true })}
                placeholder="Rate this book"
                className="focus:ring-2 focus:ring-blue-500"
              />
              {errors.rating && (
                <p className="text-sm text-red-600">{errors.rating.message}</p>
              )}
            </div>
          </div>

          {/* Completed Date */}
          <div className="space-y-2">
            <Label htmlFor="completedOn">Completion Date</Label>
            <Input
              id="completedOn"
              type="date"
              {...register('completedOn')}
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cover URL */}
          <div className="space-y-2">
            <Label htmlFor="coverUrl">Cover Image URL</Label>
            <Input
              id="coverUrl"
              {...register('coverUrl')}
              placeholder="https://example.com/book-cover.jpg"
              className="focus:ring-2 focus:ring-blue-500"
            />
            {errors.coverUrl && (
              <p className="text-sm text-red-600">{errors.coverUrl.message}</p>
            )}
          </div>

          {/* Review */}
          <div className="space-y-2">
            <Label htmlFor="review">Review</Label>
            <Textarea
              id="review"
              {...register('review')}
              placeholder="Write your thoughts about this book..."
              rows={4}
              className="focus:ring-2 focus:ring-blue-500"
            />
            {errors.review && (
              <p className="text-sm text-red-600">{errors.review.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

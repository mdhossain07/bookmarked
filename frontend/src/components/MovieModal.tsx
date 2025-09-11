import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus, X, Film } from 'lucide-react';
import { useMedia } from '@/contexts/MediaContext';
import { toast } from '@/hooks/use-toast';
import type { Movie } from 'bookmarked-types';

// Form validation schema
const movieSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  director: z.string().optional(),
  industry: z.enum(['Hollywood', 'Bollywood', 'Bangla', 'South Indian', 'Foreign']),
  genres: z.array(z.string()).min(1, 'At least one genre is required'),
  status: z.enum(['watched', 'watching', 'to watch']),
  rating: z.number().min(1).max(5).optional(),
  review: z.string().max(2000, 'Review too long').optional(),
  completedOn: z.string().optional(),
  coverUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type MovieFormData = z.infer<typeof movieSchema>;

interface MovieModalProps {
  movie?: Movie;
  isEdit?: boolean;
  trigger?: React.ReactNode;
}

const INDUSTRIES = ['Hollywood', 'Bollywood', 'Bangla', 'South Indian', 'Foreign'];
const COMMON_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi',
  'Thriller', 'Fantasy', 'Mystery', 'Crime', 'Documentary', 'Animation'
];

export default function MovieModal({ movie, isEdit = false, trigger }: MovieModalProps) {
  const [open, setOpen] = useState(false);
  const [genres, setGenres] = useState<string[]>(movie?.genres || []);
  const [newGenre, setNewGenre] = useState('');
  const { addMovie, updateMovie } = useMedia();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: movie?.title || '',
      director: movie?.director || '',
      industry: movie?.industry || 'Hollywood',
      genres: movie?.genres || [],
      status: movie?.status || 'to watch',
      rating: movie?.rating || undefined,
      review: movie?.review || '',
      completedOn: movie?.completedOn ? new Date(movie.completedOn).toISOString().split('T')[0] : '',
      coverUrl: movie?.coverUrl || '',
    },
  });

  // Update genres in form when local state changes
  useEffect(() => {
    setValue('genres', genres);
  }, [genres, setValue]);

  const onSubmit = async (data: MovieFormData) => {
    try {
      const movieData = {
        ...data,
        genres,
        completedOn: data.completedOn ? new Date(data.completedOn) : undefined,
        rating: data.rating || undefined,
        coverUrl: data.coverUrl || undefined,
      };

      if (isEdit && movie) {
        await updateMovie(movie._id, movieData);
        toast({
          title: 'Success',
          description: 'Movie updated successfully!',
        });
      } else {
        await addMovie(movieData);
        toast({
          title: 'Success',
          description: 'Movie added successfully!',
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

  const addGenre = (genre: string) => {
    if (genre && !genres.includes(genre)) {
      setGenres([...genres, genre]);
      setNewGenre('');
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setGenres(genres.filter(g => g !== genreToRemove));
  };

  const defaultTrigger = (
    <Button className="bg-purple-600 hover:bg-purple-700">
      <Plus className="w-4 h-4 mr-2" />
      Add Movie
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="w-5 h-5" />
            {isEdit ? 'Edit Movie' : 'Add New Movie'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update your movie details' : 'Add a new movie to your collection'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter movie title"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Director */}
          <div>
            <Label htmlFor="director">Director</Label>
            <Input
              id="director"
              {...register('director')}
              placeholder="Enter director name"
            />
          </div>

          {/* Industry and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={watch('industry')}
                onValueChange={(value) => setValue('industry', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to watch">Want to Watch</SelectItem>
                  <SelectItem value="watching">Currently Watching</SelectItem>
                  <SelectItem value="watched">Watched</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Genres */}
          <div>
            <Label>Genres *</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {genres.map(genre => (
                <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                  {genre}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeGenre(genre)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                placeholder="Add genre"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGenre(newGenre);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addGenre(newGenre)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {COMMON_GENRES.filter(g => !genres.includes(g)).map(genre => (
                <Button
                  key={genre}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => addGenre(genre)}
                >
                  {genre}
                </Button>
              ))}
            </div>
            {errors.genres && (
              <p className="text-sm text-red-600 mt-1">{errors.genres.message}</p>
            )}
          </div>

          {/* Rating and Completed Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                {...register('rating', { valueAsNumber: true })}
                placeholder="Rate this movie"
              />
            </div>

            <div>
              <Label htmlFor="completedOn">Completed Date</Label>
              <Input
                id="completedOn"
                type="date"
                {...register('completedOn')}
              />
            </div>
          </div>

          {/* Cover URL */}
          <div>
            <Label htmlFor="coverUrl">Cover Image URL</Label>
            <Input
              id="coverUrl"
              {...register('coverUrl')}
              placeholder="https://example.com/movie-poster.jpg"
            />
            {errors.coverUrl && (
              <p className="text-sm text-red-600 mt-1">{errors.coverUrl.message}</p>
            )}
          </div>

          {/* Review */}
          <div>
            <Label htmlFor="review">Review/Notes</Label>
            <Textarea
              id="review"
              {...register('review')}
              placeholder="Write your thoughts about this movie..."
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4">
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
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Movie' : 'Add Movie'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

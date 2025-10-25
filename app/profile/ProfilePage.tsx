'use client';

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { Loader2, UploadCloud } from 'lucide-react';

import { useAuth, type AuthenticatedUser } from '@/app/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { fetcher } from '@/lib/fetcher';

interface ProfileFormValues {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileStats {
  totalProjects: number;
  totalIdeas: number;
  memberSince: string | null;
}

interface ProfileMutationResponse {
  message: string;
  user: AuthenticatedUser;
}

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? '—' : parsed.toLocaleDateString();
};

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name ?? user?.displayName ?? '',
      email: user?.email ?? '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? user.displayName ?? '',
        email: user.email ?? '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user, reset]);

  const userId = user?._id || user?.id;
  const statsKey = userId ? `/api/users/${userId}/stats` : null;

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useSWR<ProfileStats>(statsKey, (url) => fetcher<ProfileStats>(url));

  const watchedNewPassword = watch('newPassword');
  const watchedConfirmPassword = watch('confirmPassword');
  const passwordMismatch =
    !!watchedNewPassword && !!watchedConfirmPassword && watchedNewPassword !== watchedConfirmPassword;

  const initials = useMemo(() => {
    if (!user?.name && !user?.displayName && !user?.email) {
      return 'U';
    }

    const source = user?.name || user?.displayName || user?.email || '';
    return source
      .split(' ')
      .map((segment) => segment?.[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) {
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploadingAvatar(true);

    try {
      await fetcher<ProfileMutationResponse>(`/api/users/${userId}/avatar`, {
        method: 'POST',
        body: formData,
      });

      toast({
        title: 'Avatar aggiornato!',
        description: 'La tua immagine profilo è stata salvata correttamente.',
      });

      await refreshUser();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Caricamento fallito',
        description: error instanceof Error ? error.message : 'Non è stato possibile aggiornare l\'avatar.',
      });
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!userId) {
      return;
    }

    if (values.newPassword && values.newPassword !== values.confirmPassword) {
      toast({
        variant: 'destructive',
        description: 'Le nuove password non coincidono.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim(),
        currentPassword: values.currentPassword,
        ...(values.newPassword ? { newPassword: values.newPassword } : {}),
      };

      await fetcher<ProfileMutationResponse>(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      toast({
        title: 'Profilo aggiornato',
        description: 'Le modifiche sono state salvate con successo.',
      });

      await refreshUser();

      reset({
        name: payload.name,
        email: payload.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Aggiornamento non riuscito',
        description:
          error instanceof Error ? error.message : 'Si è verificato un problema durante il salvataggio del profilo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Caricamento del profilo in corso</span>
      </div>
    );
  }

  if (!user || !userId) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-12 text-center">
        <h1 className="text-3xl font-semibold">Accedi per vedere il profilo</h1>
        <p className="text-muted-foreground">
          Questa pagina è disponibile solo per gli utenti autenticati. Effettua l\'accesso per gestire il tuo account.
        </p>
        <Button asChild className="mx-auto">
          <a href="/login">Vai al login</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Profilo personale</h1>
        <p className="text-muted-foreground">Aggiorna i tuoi dati, carica una nuova immagine e gestisci la password.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="space-y-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name ?? 'Avatar utente'} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{user.name ?? user.displayName ?? 'Profilo'}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAvatarUploadClick}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Caricamento...
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4" aria-hidden="true" />
                    Carica nuovo avatar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Membro dal</p>
                <p className="text-lg font-semibold">{formatDate(stats?.memberSince || user.createdAt)}</p>
              </div>
              <Separator />
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Progetti totali</dt>
                  <dd className="text-2xl font-semibold">
                    {statsLoading ? '...' : statsError ? '—' : stats?.totalProjects ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Idee generate</dt>
                  <dd className="text-2xl font-semibold">
                    {statsLoading ? '...' : statsError ? '—' : stats?.totalIdeas ?? 0}
                  </dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>

        <form className="lg:col-span-2 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Dati personali</CardTitle>
              <CardDescription>Le informazioni di base visibili nella dashboard e nelle email.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Inserisci il tuo nome completo"
                  {...register('name', { required: 'Il nome è obbligatorio' })}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tuo.nome@email.com"
                  {...register('email', {
                    required: 'L\'email è obbligatoria',
                    pattern: {
                      value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i,
                      message: 'Inserisci un indirizzo email valido',
                    },
                  })}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sicurezza</CardTitle>
              <CardDescription>Per salvare qualsiasi modifica serve confermare la password attuale.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="currentPassword">Password attuale</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('currentPassword', { required: 'La password attuale è obbligatoria' })}
                />
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nuova password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Almeno 6 caratteri"
                  {...register('newPassword')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Conferma nuova password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ripeti password"
                  {...register('confirmPassword')}
                />
                {passwordMismatch && (
                  <p className="text-sm text-destructive">Le nuove password non coincidono.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Salvataggio in corso...
                </>
              ) : (
                'Salva modifiche'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

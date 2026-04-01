import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { navigateTo } from '@/router';
import { LocalStorageEnum } from '@/types';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const loginHandler = () => {
    localStorage.setItem(LocalStorageEnum.AccessToken, 'FAKE_TOKEN');
    navigateTo('/');
  };
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Giriş Yap</CardTitle>
          <CardDescription>Hesabına giriş yapmak için eposta adresini gir</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">E-posta</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Şifre</FieldLabel>
                </div>
                <Input id="password" type="password" />
              </Field>
              <Field>
                <Button type="button" onClick={() => loginHandler()}>
                  Giriş Yap
                </Button>
                <FieldDescription className="text-center">
                  Hesabın yok mu?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('/register');
                    }}
                  >
                    Kayıt Ol
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

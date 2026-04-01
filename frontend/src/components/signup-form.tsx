import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { navigateTo } from '@/router';

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Kayıt Ol</CardTitle>
        <CardDescription>Aşağıdaki bilgilerini girerek kayıt ol</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Adı</FieldLabel>
              <Input id="name" type="text" placeholder="John Doe" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">E-posta</FieldLabel>
              <Input id="email" type="email" placeholder="m@example.com" required />
              <FieldDescription>Bu e-postayı seninle iletişime geçmek için kullanacağız.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Şifre</FieldLabel>
              <Input id="password" type="password" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">Şifre Tekrar</FieldLabel>
              <Input id="confirm-password" type="password" required />
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Hesap Oluştur</Button>
                <FieldDescription className="px-6 text-center">
                  Zaten hesabın var mı?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('/login');
                    }}
                  >
                    Giriş yap
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

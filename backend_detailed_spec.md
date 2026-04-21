# 🛠️ Spécification Technique Complète — Backend NestJS

> **Projet :** Plateforme de Location de Voitures
> **Version :** 2.0 — Backend NestJS
> **Stack :** NestJS 10 · Prisma 5 · PostgreSQL 16 · Node.js 20

---

## 📑 Table des Matières

1. [Module 1: Architecture Core & Configuration](#module-1-architecture-core--configuration)
2. [Module 2: Authentification & Sécurité](#module-2-authentification--sécurité)
3. [Module 3: Gestion des Utilisateurs](#module-3-gestion-des-utilisateurs)
4. [Module 4: Gestion de la Flotte (Véhicules)](#module-4-gestion-de-la-flotte-véhicules)
5. [Module 5: Moteur de Réservations](#module-5-moteur-de-réservations)
6. [Module 6: Intégration Paiements](#module-6-intégration-paiements)
7. [Module 7: Règles de Tarification](#module-7-règles-de-tarification)
8. [Module 8: Maintenance & Opérations](#module-8-maintenance--opérations)
9. [Module 9: Dashboard & Analytics](#module-9-dashboard--analytics)
10. [Module 10: Système de Notifications](#module-10-système-de-notifications)
11. [Module 11: Services Email & PDF](#module-11-services-email--pdf)
12. [Module 12: Upload & Stockage Fichiers](#module-12-upload--stockage-fichiers)
13. [Module 13: Scheduler & Tâches Planifiées](#module-13-scheduler--tâches-planifiées)
14. [Référence API Endpoints](#référence-api-endpoints)
15. [Règles Métier](#règles-métier)

---

# Module 1: Architecture Core & Configuration

## 1.1 Stack Technologique Backend

### Dépendances Principales
- **@nestjs/core** (v10+) : Framework principal
- **@nestjs/platform-express** : Adaptateur HTTP
- **@nestjs/config** : Gestion variables environnement
- **@nestjs/jwt** : Gestion tokens JWT
- **@nestjs/passport** : Stratégies authentification
- **@nestjs/throttler** : Rate limiting
- **@nestjs/schedule** : Tâches cron
- **@nestjs/swagger** : Documentation API auto
- **@nestjs/cache-manager** : Cache Redis

### ORM & Base de Données
- **prisma** (v5+) : ORM Prisma
- **@prisma/client** : Client Prisma généré
- **PostgreSQL 16** : Base de données relationnelle

### Validation & Transformation
- **class-validator** : Validation DTOs
- **class-transformer** : Transformation données

### Sécurité
- **bcryptjs** : Hachage mots de passe (rounds: 12)
- **passport-jwt** : Stratégie JWT
- **passport-local** : Stratégie locale
- **helmet** : Sécurisation headers HTTP
- **cookie-parser** : Gestion cookies

### Paiements
- **stripe** (v15+) : SDK Stripe officiel
- **axios** : Appels API Paymee

### Communication
- **@nestjs-modules/mailer** : Module email
- **nodemailer** : Envoi emails SMTP
- **handlebars** : Templates email

### PDF & Images
- **pdfkit** : Génération PDF contrats
- **multer** : Upload fichiers
- **sharp** : Optimisation images
- **uuid** : Génération IDs uniques

### Utilitaires
- **date-fns** : Manipulation dates
- **cache-manager-redis-store** : Store Redis cache

---

## 1.2 Structure du Projet

```
car-rental-api/
├── prisma/
│   ├── schema.prisma              ← Schéma base de données
│   ├── migrations/                ← Migrations générées
│   └── seed.ts                    ← Script seed (admin + données)
│
├── src/
│   ├── main.ts                    ← Point d'entrée, bootstrap
│   ├── app.module.ts              ← Module racine
│   │
│   ├── config/                    ← Fichiers configuration typés
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── mail.config.ts
│   │   ├── stripe.config.ts
│   │   ├── paymee.config.ts
│   │   └── storage.config.ts
│   │
│   ├── prisma/                    ← Module Prisma global
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── common/                    ← Partagé entre modules
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   ├── pipes/
│   │   │   └── parse-int-optional.pipe.ts
│   │   └── dto/
│   │       └── pagination.dto.ts
│   │
│   ├── auth/                      ← Module Authentification
│   ├── users/                     ← Module Utilisateurs
│   ├── vehicles/                  ← Module Véhicules
│   ├── bookings/                  ← Module Réservations
│   ├── payments/                  ← Module Paiements
│   ├── pricing/                   ← Module Tarification
│   ├── maintenance/               ← Module Maintenance
│   ├── dashboard/                 ← Module Dashboard
│   ├── notifications/             ← Module Notifications
│   ├── mail/                      ← Module Email
│   ├── pdf/                       ← Module PDF
│   ├── upload/                    ← Module Upload
│   └── scheduler/                 ← Module Scheduler
│
├── uploads/                       ← Dossier images
├── .env                           ← Variables environnement
├── .env.example                   ← Template variables
├── nest-cli.json
├── package.json
└── tsconfig.json
```

---

## 1.3 Configuration Globale (main.ts)

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Prefix global API
  app.setGlobalPrefix('api/v1');

  // Sécurité headers
  app.use(helmet());

  // Cookie parser (refresh token HttpOnly)
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:4200'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Validation globale DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filtre erreur global
  app.useGlobalFilters(new HttpExceptionFilter());

  // Intercepteur transformation (format uniforme)
  app.useGlobalInterceptors(new TransformInterceptor());

  // Documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('Car Rental API')
    .setDescription('API complète plateforme location de voitures')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentification & gestion compte')
    .addTag('Vehicles', 'Catalogue et gestion flotte')
    .addTag('Bookings', 'Réservations')
    .addTag('Payments', 'Paiements Paymee & Stripe')
    .addTag('Maintenance', 'Maintenance véhicules')
    .addTag('Dashboard', 'Statistiques & KPIs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application démarrée sur http://localhost:${port}`);
  logger.log(`📚 Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
```

---

## 1.4 Variables d'Environnement (.env)

```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200

# Base de données PostgreSQL
DATABASE_URL="postgresql://caruser:carpassword@localhost:5432/car_rental_db?schema=public"

# JWT
JWT_SECRET=votre_super_secret_jwt_min_32_chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=votre_refresh_secret_different
JWT_REFRESH_EXPIRES=7d

# Email SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=votre_email@gmail.com
MAIL_PASSWORD=votre_app_password_gmail
MAIL_FROM="Car Rental <noreply@votreagence.tn>"

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paymee
PAYMEE_VENDOR_TOKEN=votre_vendor_token_paymee
PAYMEE_API_URL=https://app.paymee.tn/api/v2
PAYMEE_WEBHOOK_SECRET=votre_secret_hmac_paymee

# Upload fichiers
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880  # 5MB

# Redis (Cache)
REDIS_HOST=localhost
REDIS_PORT=6379

# URLs publiques
API_URL=http://localhost:3000
APP_URL=http://localhost:4200
```

---

## 1.5 Module Prisma (Global)

### Service Prisma

```typescript
// prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### Module Prisma

```typescript
// prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()  // Disponible dans tous les modules
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

## 1.6 Éléments Communs (Common Module)

### Décorateurs

**@CurrentUser()** - Injecte l'utilisateur connecté
```typescript
// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: keyof any | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

**@Public()** - Skip JWT guard
```typescript
// common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**@Roles()** - Vérification rôle
```typescript
// common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### Guards

**JwtAuthGuard**
```typescript
// common/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

**RolesGuard**
```typescript
// common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException('Accès refusé : rôle insuffisant');
    }
    return true;
  }
}
```

### Filters

**HttpExceptionFilter**
```typescript
// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Erreur interne du serveur';

    response.status(status).json({
      success: false,
      statusCode: status,
      message: typeof message === 'string' ? message : (message as any).message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Interceptors

**TransformInterceptor**
```typescript
// common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data?: T;
  meta?: any;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data.data || data,
        meta: data.meta,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

### DTOs Communs

**PaginationDto**
```typescript
// common/dto/pagination.dto.ts
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

---

# Module 2: Authentification & Sécurité

## 2.1 Stratégies de Sécurité

### Double Token JWT
- **Access Token** : Stocké en mémoire frontend, durée 15 min
- **Refresh Token** : Stocké dans Cookie HttpOnly Secure, durée 7 jours
- **Password Hashing** : Bcrypt avec 12 rounds
- **Protection Brute-Force** : 5 tentatives login / 5 minutes

### Enums Rôles
```prisma
enum Role {
  CLIENT
  ADMIN
}
```

---

## 2.2 DTOs Auth Module

### RegisterDto
```typescript
// auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Ben Ali' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'ahmed@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MotDePasse@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '+21620123456', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '12345678', required: false })
  @IsOptional()
  @IsString()
  cin?: string;

  @ApiProperty({ example: 'TU-987654', required: false })
  @IsOptional()
  @IsString()
  drivingLicense?: string;

  @ApiProperty({ example: '2028-06-15', required: false })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;
}
```

### LoginDto
```typescript
// auth/dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ahmed@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MotDePasse@123' })
  @IsString()
  @MinLength(8)
  password: string;
}
```

### ForgotPasswordDto
```typescript
// auth/dto/forgot-password.dto.ts
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ahmed@email.com' })
  @IsEmail()
  email: string;
}
```

### ResetPasswordDto
```typescript
// auth/dto/reset-password.dto.ts
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
```

---

## 2.3 Stratégies Passport

### JWT Strategy
```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) throw new UnauthorizedException();
    return user;
  }
}
```

### Local Strategy
```typescript
// auth/strategies/local.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
```

---

## 2.4 Service Auth

```typescript
// auth/auth.service.ts
import {
  Injectable, UnauthorizedException, ConflictException,
  NotFoundException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return null;
    }
    if (!user.isActive) return null;
    return user;
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Cet email est déjà utilisé');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const emailVerifyToken = uuidv4();

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: undefined,
        passwordHash,
        emailVerifyToken,
        licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : undefined,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    await this.mailService.sendWelcome(user.email, user.firstName, emailVerifyToken);
    return { message: 'Compte créé. Veuillez vérifier votre email.', user };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Token invalide');
      }
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) throw new BadRequestException('Token invalide');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerifyToken: null },
    });
    return { message: 'Email vérifié avec succès' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'Si cet email existe, un lien a été envoyé' };

    const resetToken = uuidv4();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry: expiry },
    });

    await this.mailService.sendPasswordReset(user.email, user.firstName, resetToken);
    return { message: 'Lien de réinitialisation envoyé' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gte: new Date() } },
    });
    if (!user) throw new BadRequestException('Token invalide ou expiré');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null, refreshToken: null },
    });
    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Déconnexion réussie' };
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
```

---

## 2.5 Controller Auth

```typescript
// auth/auth.controller.ts
import {
  Controller, Post, Body, Get, UseGuards,
  HttpCode, HttpStatus, Res, Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    
    // Set refresh token in HttpOnly cookie
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken: result.accessToken, user: result.user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: any, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.refreshToken;
    const result = await this.authService.refresh(refreshToken);

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(user.id);
    response.clearCookie('refreshToken');
    return { message: 'Déconnexion réussie' };
  }

  @Public()
  @Get('verify-email')
  async verifyEmail(@Req() req: any) {
    const token = req.query.token as string;
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
```

---

## 2.6 Module Auth Configuration

```typescript
// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## 2.7 Cas d'Erreur Auth

| Code | Message | Description |
|------|---------|-------------|
| 401 | Email ou mot de passe incorrect | Login échoué |
| 401 | Token invalide ou expiré | Refresh token invalide |
| 403 | Accès refusé : rôle insuffisant | Rôle non autorisé |
| 409 | Cet email est déjà utilisé | Email existe déjà |
| 400 | Token invalide | Reset token invalide/expiré |
| 400 | Token invalide ou expiré | Verify email token invalide |

---

# Module 3: Gestion des Utilisateurs

## 3.1 Modèle Prisma User

```prisma
model User {
  id                Int       @id @default(autoincrement())
  email             String    @unique
  firstName         String
  lastName          String
  passwordHash      String
  phone             String?
  cin               String?
  drivingLicense    String?
  licenseExpiry     DateTime?
  role              Role      @default(CLIENT)
  isActive          Boolean   @default(true)
  isEmailVerified   Boolean   @default(false)
  emailVerifyToken  String?
  resetToken        String?
  resetTokenExpiry  DateTime?
  refreshToken      String?
  avatarUrl         String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  bookings          Booking[]
  payments          Payment[]
  notifications     Notification[]
  reviews           Review[]
}
```

---

## 3.2 DTOs Users Module

### UpdateProfileDto
```typescript
// users/dto/update-profile.dto.ts
import { IsString, IsOptional, IsEmail, IsDateString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ahmed' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Ben Ali' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'ahmed@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+21620123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '12345678' })
  @IsOptional()
  @IsString()
  cin?: string;

  @ApiPropertyOptional({ example: 'TU-987654' })
  @IsOptional()
  @IsString()
  drivingLicense?: string;

  @ApiPropertyOptional({ example: '2028-06-15' })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;
}
```

### ChangePasswordDto
```typescript
// users/dto/change-password.dto.ts
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
```

### FilterUsersDto
```typescript
// users/dto/filter-users.dto.ts
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterUsersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: 'CLIENT' | 'ADMIN';
}
```

---

## 3.3 Service Users

```typescript
// users/users.service.ts
import {
  Injectable, NotFoundException, ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FilterUsersDto } from './dto/filter-users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        cin: true,
        drivingLicense: true,
        licenseExpiry: true,
        role: true,
        avatarUrl: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    if (dto.email) {
      const exists = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
      });
      if (exists) throw new ConflictException('Cet email est déjà utilisé');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        cin: true,
        drivingLicense: true,
        licenseExpiry: true,
        role: true,
        avatarUrl: true,
        isEmailVerified: true,
      },
    });
    return user;
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) throw new ForbiddenException('Mot de passe actuel incorrect');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { message: 'Mot de passe modifié avec succès' };
  }

  async getAllUsers(dto: FilterUsersDto) {
    const { page, limit, search, isActive, role } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    if (isActive !== undefined) where.isActive = isActive;
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        cin: true,
        drivingLicense: true,
        licenseExpiry: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        bookings: {
          select: {
            id: true,
            bookingReference: true,
            startDate: true,
            endDate: true,
            status: true,
            totalAmount: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { bookings: true, payments: true } },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async toggleUserStatus(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (user.role === 'ADMIN') throw new ForbiddenException('Impossible de bloquer un admin');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
    return { message: `Utilisateur ${updated.isActive ? 'activé' : 'bloqué'}`, isActive: updated.isActive };
  }

  async getUserStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: { select: { bookings: true } },
        bookings: {
          select: { totalAmount: true },
        },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const totalSpent = user.bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    return {
      totalBookings: user._count.bookings,
      totalSpent,
      averageSpent: user._count.bookings > 0 ? totalSpent / user._count.bookings : 0,
    };
  }
}
```

---

## 3.4 Controller Users

```typescript
// users/users.controller.ts
import {
  Controller, Get, Put, Patch, Body, Param,
  UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto);
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  getMyStats(@CurrentUser() user: any) {
    return this.usersService.getUserStats(user.id);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAllUsers(@Query() dto: FilterUsersDto) {
    return this.usersService.getAllUsers(dto);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(parseInt(id));
  }

  @Patch('admin/:id/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  toggleUserStatus(@Param('id') id: string) {
    return this.usersService.toggleUserStatus(parseInt(id));
  }
}
```

---

## 3.5 Module Users Configuration

```typescript
// users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

# Module 4: Gestion de la Flotte (Véhicules)

## 4.1 Modèle Prisma Vehicle

```prisma
model Vehicle {
  id              Int       @id @default(autoincrement())
  registration    String    @unique
  brand           String
  model           String
  year            Int
  color           String
  category        VehicleCategory
  transmission    TransmissionType
  fuel            FuelType
  seats           Int
  doors           Int
  dailyRate       Float
  depositAmount   Float
  mileage         Int
  status          VehicleStatus @default(AVAILABLE)
  features        String[]  @default([])
  description     String?
  images          VehicleImage[]
  bookings        Booking[]
  maintenance     MaintenanceRecord[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model VehicleImage {
  id        Int      @id @default(autoincrement())
  vehicleId Int
  url       String
  order     Int      @default(0)
  vehicle   Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
}

enum VehicleCategory {
  ECONOMY
  SEDAN
  SUV
  LUXURY
  VAN
}

enum TransmissionType {
  MANUAL
  AUTOMATIC
}

enum FuelType {
  PETROL
  DIESEL
  HYBRID
  ELECTRIC
}

enum VehicleStatus {
  AVAILABLE
  RENTED
  MAINTENANCE
  OUT_OF_SERVICE
}
```

---

## 4.2 DTOs Vehicles Module

### CreateVehicleDto
```typescript
// vehicles/dto/create-vehicle.dto.ts
import { IsString, IsInt, IsNumber, IsEnum, IsArray, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'AB-123-TU' })
  @IsString()
  registration: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  @Min(1990)
  year: number;

  @ApiProperty({ example: 'Blanc' })
  @IsString()
  color: string;

  @ApiProperty({ enum: ['ECONOMY', 'SEDAN', 'SUV', 'LUXURY', 'VAN'] })
  @IsEnum(['ECONOMY', 'SEDAN', 'SUV', 'LUXURY', 'VAN'])
  category: string;

  @ApiProperty({ enum: ['MANUAL', 'AUTOMATIC'] })
  @IsEnum(['MANUAL', 'AUTOMATIC'])
  transmission: string;

  @ApiProperty({ enum: ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'] })
  @IsEnum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'])
  fuel: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(2)
  seats: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(2)
  doors: number;

  @ApiProperty({ example: 110.0 })
  @IsNumber()
  @Min(0)
  dailyRate: number;

  @ApiProperty({ example: 200.0 })
  @IsNumber()
  @Min(0)
  depositAmount: number;

  @ApiProperty({ example: 15000 })
  @IsInt()
  @Min(0)
  mileage: number;

  @ApiProperty({ enum: ['AVAILABLE', 'RENTED', 'MAINTENANCE', 'OUT_OF_SERVICE'] })
  @IsEnum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'OUT_OF_SERVICE'])
  status?: string;

  @ApiProperty({ example: ['Climatisation', 'Bluetooth', 'Caméra recul'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
```

### UpdateVehicleDto
```typescript
// vehicles/dto/update-vehicle.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateVehicleDto } from './create-vehicle.dto';

export class UpdateVehicleDto extends PartialType(
  OmitType(CreateVehicleDto, ['registration'] as const)
) {}
```

### FilterVehiclesDto
```typescript
// vehicles/dto/filter-vehicles.dto.ts
import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterVehiclesDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['ECONOMY', 'SEDAN', 'SUV', 'LUXURY', 'VAN'] })
  @IsOptional()
  @IsEnum(['ECONOMY', 'SEDAN', 'SUV', 'LUXURY', 'VAN'])
  category?: string;

  @ApiPropertyOptional({ enum: ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'] })
  @IsOptional()
  @IsEnum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'])
  fuel?: string;

  @ApiPropertyOptional({ enum: ['MANUAL', 'AUTOMATIC'] })
  @IsOptional()
  @IsEnum(['MANUAL', 'AUTOMATIC'])
  transmission?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  minSeats?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(9)
  maxSeats?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: ['Climatisation', 'Bluetooth'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ enum: ['AVAILABLE', 'RENTED', 'MAINTENANCE', 'OUT_OF_SERVICE'] })
  @IsOptional()
  @IsEnum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'OUT_OF_SERVICE'])
  status?: string;
}
```

### CheckAvailabilityDto
```typescript
// vehicles/dto/check-availability.dto.ts
import { IsDateString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckAvailabilityDto {
  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-01-20' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  vehicleId?: number;
}
```

---

## 4.3 Service Vehicles

```typescript
// vehicles/vehicles.service.ts
import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FilterVehiclesDto } from './dto/filter-vehicles.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async getAllVehicles(dto: FilterVehiclesDto) {
    const { page, limit, search, category, fuel, transmission, minSeats, maxSeats, minPrice, maxPrice, features, status } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { registration: { contains: search } },
      ];
    }
    if (category) where.category = category;
    if (fuel) where.fuel = fuel;
    if (transmission) where.transmission = transmission;
    if (minSeats) where.seats = { ...where.seats, gte: minSeats };
    if (maxSeats) where.seats = { ...where.seats, lte: maxSeats };
    if (minPrice) where.dailyRate = { ...where.dailyRate, gte: minPrice };
    if (maxPrice) where.dailyRate = { ...where.dailyRate, lte: maxPrice };
    if (status) where.status = status;
    if (features && features.length > 0) {
      where.features = { hasEvery: features };
    }

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { bookings: true, reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getVehicleById(id: number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');
    return vehicle;
  }

  async createVehicle(dto: CreateVehicleDto) {
    const exists = await this.prisma.vehicle.findUnique({
      where: { registration: dto.registration },
    });
    if (exists) throw new ConflictException('Ce numéro d\'immatriculation existe déjà');

    return this.prisma.vehicle.create({
      data: dto,
      include: { images: true },
    });
  }

  async updateVehicle(id: number, dto: UpdateVehicleDto) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');

    if (dto.registration && dto.registration !== vehicle.registration) {
      const exists = await this.prisma.vehicle.findUnique({
        where: { registration: dto.registration },
      });
      if (exists) throw new ConflictException('Ce numéro d\'immatriculation existe déjà');
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: dto,
      include: { images: true },
    });
  }

  async deleteVehicle(id: number) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');

    await this.prisma.vehicle.delete({ where: { id } });
    return { message: 'Véhicule supprimé' };
  }

  async updateVehicleStatus(id: number, status: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');

    return this.prisma.vehicle.update({
      where: { id },
      data: { status },
    });
  }

  async checkAvailability(dto: CheckAvailabilityDto) {
    const { startDate, endDate, vehicleId } = dto;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new ConflictException('La date de fin doit être après la date de début');
    }

    const where: any = {
      status: { in: ['AVAILABLE'] },
    };

    if (vehicleId) {
      where.id = vehicleId;
    }

    // Exclure les véhicules avec réservations qui chevauchent
    const bookedVehicles = await this.prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        startDate: { lt: end },
        endDate: { gt: start },
      },
      select: { vehicleId: true },
    });

    const bookedIds = bookedVehicles.map(b => b.vehicleId);
    if (bookedIds.length > 0) {
      where.id = { notIn: bookedIds };
    }

    const availableVehicles = await this.prisma.vehicle.findMany({
      where,
      include: { images: { orderBy: { order: 'asc' } } },
    });

    return {
      available: availableVehicles.length,
      vehicles: availableVehicles,
    };
  }

  async getVehicleAvailability(vehicleId: number, year: number, month: number) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const bookings = await this.prisma.booking.findMany({
      where: {
        vehicleId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      select: { startDate: true, endDate: true },
    });

    const blockedDates = bookings.flatMap(b => {
      const dates: string[] = [];
      const current = new Date(b.startDate);
      const end = new Date(b.endDate);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    });

    return {
      vehicleId,
      year,
      month,
      blockedDates,
    };
  }

  async getCategories() {
    return ['ECONOMY', 'SEDAN', 'SUV', 'LUXURY', 'VAN'];
  }
}
```

---

## 4.4 Controller Vehicles

```typescript
// vehicles/vehicles.controller.ts
import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FilterVehiclesDto } from './dto/filter-vehicles.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Public()
  @Get()
  getAllVehicles(@Query() dto: FilterVehiclesDto) {
    return this.vehiclesService.getAllVehicles(dto);
  }

  @Public()
  @Get(':id')
  getVehicleById(@Param('id') id: string) {
    return this.vehiclesService.getVehicleById(parseInt(id));
  }

  @Public()
  @Get(':id/availability')
  getVehicleAvailability(
    @Param('id') id: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.vehiclesService.getVehicleAvailability(
      parseInt(id),
      parseInt(year),
      parseInt(month),
    );
  }

  @Public()
  @Get('categories/list')
  getCategories() {
    return this.vehiclesService.getCategories();
  }

  @Public()
  @Post('availability/check')
  checkAvailability(@Body() dto: CheckAvailabilityDto) {
    return this.vehiclesService.checkAvailability(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin')
  createVehicle(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.createVehicle(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('admin/:id')
  updateVehicle(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.updateVehicle(parseInt(id), dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/:id')
  deleteVehicle(@Param('id') id: string) {
    return this.vehiclesService.deleteVehicle(parseInt(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/:id/status')
  updateVehicleStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.vehiclesService.updateVehicleStatus(parseInt(id), body.status);
  }
}
```

---

## 4.5 Module Vehicles Configuration

```typescript
// vehicles/vehicles.module.ts
import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
```

---

# Module 5: Moteur de Réservations

## 5.1 Modèle Prisma Booking

```prisma
model Booking {
  id                Int       @id @default(autoincrement())
  bookingReference String    @unique
  clientId          Int
  vehicleId         Int
  startDate         DateTime
  endDate           DateTime
  pickupTime        String?
  returnTime        String?
  durationDays      Int
  dailyRate         Float
  discountAmount    Float     @default(0)
  subtotal          Float
  depositAmount     Float
  totalAmount       Float
  status            BookingStatus @default(PENDING)
  paymentStatus     PaymentStatus @default(PENDING)
  notes             String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  client            User      @relation(fields: [clientId], references: [id])
  vehicle           Vehicle   @relation(fields: [vehicleId], references: [id])
  payment           Payment?
  reviews           Review[]
}

enum BookingStatus {
  PENDING
  CONFIRMED
  ACTIVE
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum PaymentStatus {
  PENDING
  PAID
  PARTIALLY_REFUNDED
  REFUNDED
  FAILED
}
```

---

## 5.2 DTOs Bookings Module

### CreateBookingDto
```typescript
// bookings/dto/create-booking.dto.ts
import { IsInt, IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  vehicleId: number;

  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-01-20' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: '09:00', required: false })
  @IsOptional()
  @IsString()
  pickupTime?: string;

  @ApiProperty({ example: '18:00', required: false })
  @IsOptional()
  @IsString()
  returnTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
```

### UpdateBookingDto
```typescript
// bookings/dto/update-booking.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';

export class UpdateBookingDto extends PartialType(
  OmitType(CreateBookingDto, ['vehicleId'] as const)
) {}
```

### FilterBookingsDto
```typescript
// bookings/dto/filter-bookings.dto.ts
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterBookingsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] })
  @IsOptional()
  @IsEnum(['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
  status?: string;

  @ApiPropertyOptional({ enum: ['PENDING', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED'] })
  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED'])
  paymentStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDateTo?: string;
}
```

---

## 5.3 Service Bookings

```typescript
// bookings/bookings.service.ts
import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { differenceInDays, parseISO } from 'date-fns';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { FilterBookingsDto } from './dto/filter-bookings.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async createBooking(userId: number, dto: CreateBookingDto) {
    const { vehicleId, startDate, endDate } = dto;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new BadRequestException('La date de fin doit être après la date de début');
    }

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');
    if (vehicle.status !== 'AVAILABLE') {
      throw new ConflictException('Ce véhicule n\'est pas disponible');
    }

    // Vérifier disponibilité
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        startDate: { lt: end },
        endDate: { gt: start },
      },
    });

    if (overlapping) {
      throw new ConflictException('Ce véhicule est déjà réservé pour ces dates');
    }

    // Calcul durée
    const durationDays = differenceInDays(end, start) + 1;

    // Récupérer règles prix actives
    const priceRules = await this.prisma.priceRule.findMany({
      where: { isActive: true },
    });

    // Calcul prix avec règles
    const pricing = this.calculatePrice(vehicle.dailyRate, durationDays, start, end, priceRules);

    // Générer référence
    const bookingReference = `REF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    const booking = await this.prisma.booking.create({
      data: {
        bookingReference,
        clientId: userId,
        vehicleId,
        startDate: start,
        endDate: end,
        pickupTime: dto.pickupTime || '09:00',
        returnTime: dto.returnTime || '18:00',
        durationDays,
        dailyRate: vehicle.dailyRate,
        discountAmount: pricing.discountAmount,
        subtotal: pricing.subtotal,
        depositAmount: vehicle.depositAmount,
        totalAmount: pricing.total,
        notes: dto.notes,
      },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        vehicle: { select: { id: true, brand: true, model: true, registration: true, images: true } },
      },
    });

    return booking;
  }

  async getMyBookings(userId: number, dto: FilterBookingsDto) {
    const { page, limit, status, paymentStatus, startDateFrom, startDateTo, endDateFrom, endDateTo } = dto;
    const skip = (page - 1) * limit;

    const where: any = { clientId: userId };
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (startDateFrom) where.startDate = { ...where.startDate, gte: new Date(startDateFrom) };
    if (startDateTo) where.startDate = { ...where.startDate, lte: new Date(startDateTo) };
    if (endDateFrom) where.endDate = { ...where.endDate, gte: new Date(endDateFrom) };
    if (endDateTo) where.endDate = { ...where.endDate, lte: new Date(endDateTo) };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          vehicle: { select: { brand: true, model: true, images: { orderBy: { order: 'asc' }, take: 1 } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getMyBookingById(userId: number, id: number) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, clientId: userId },
      include: {
        client: { select: { firstName: true, lastName: true, email: true, phone: true, cin: true } },
        vehicle: { select: { brand: true, model: true, registration: true, category: true, images: true } },
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Réservation non trouvée');
    return booking;
  }

  async cancelMyBooking(userId: number, id: number) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, clientId: userId },
      include: { vehicle: true, payment: true },
    });
    if (!booking) throw new NotFoundException('Réservation non trouvée');
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new ForbiddenException('Cette réservation ne peut plus être annulée');
    }

    // Calcul frais annulation
    const agencyConfig = await this.prisma.agencyConfig.findFirst();
    const hoursUntilStart = differenceInDays(booking.startDate, new Date()) * 24;
    let refundPercent = 0;

    if (hoursUntilStart > agencyConfig?.freeCancelHours || 48) {
      refundPercent = 100;
    } else if (hoursUntilStart > 24) {
      refundPercent = agencyConfig?.cancelFee24to48 || 70;
    } else if (hoursUntilStart > 0) {
      refundPercent = agencyConfig?.cancelFeeLess24 || 50;
    }

    await this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Remboursement si payé
    if (booking.payment && booking.payment.status === 'PAID' && refundPercent > 0) {
      const refundAmount = booking.payment.amount * (refundPercent / 100);
      // Appel service remboursement Paymee/Stripe
    }

    return {
      message: 'Réservation annulée',
      refundPercent,
      refundableAmount: booking.payment ? booking.payment.amount * (refundPercent / 100) : 0,
    };
  }

  async getAllBookings(dto: FilterBookingsDto) {
    const { page, limit, search, status, paymentStatus } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { bookingReference: { contains: search } },
        { client: { firstName: { contains: search, mode: 'insensitive' } } },
        { client: { lastName: { contains: search, mode: 'insensitive' } } },
        { vehicle: { brand: { contains: search, mode: 'insensitive' } } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          vehicle: { select: { brand: true, model: true, registration: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBookingById(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, cin: true, drivingLicense: true } },
        vehicle: { select: { brand: true, model: true, registration: true, category: true, images: true, dailyRate: true } },
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Réservation non trouvée');
    return booking;
  }

  async updateBooking(id: number, dto: UpdateBookingDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Réservation non trouvée');
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      throw new ForbiddenException('Impossible de modifier cette réservation');
    }

    return this.prisma.booking.update({
      where: { id },
      data: dto,
      include: { client: true, vehicle: true },
    });
  }

  async updateBookingStatus(id: number, status: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id }, include: { vehicle: true } });
    if (!booking) throw new NotFoundException('Réservation non trouvée');

    // Mettre à jour statut véhicule si nécessaire
    if (status === 'ACTIVE') {
      await this.prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'RENTED' },
      });
    } else if (status === 'COMPLETED' || status === 'CANCELLED') {
      await this.prisma.vehicle.update({
        where: { id: booking.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status },
    });
  }

  async confirmByIdAndPay(bookingId: number, paymentData: any) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { vehicle: true } });
    if (!booking) throw new NotFoundException('Réservation non trouvée');
    if (booking.status !== 'PENDING') throw new ConflictException('Réservation déjà traitée');

    // Créer enregistrement paiement
    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        amount: booking.totalAmount,
        method: paymentData.method,
        gatewayId: paymentData.gatewayId,
        gatewayResponse: paymentData.gatewayResponse,
        status: 'PAID',
      },
    });

    // Confirmer réservation
    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      },
      include: {
        client: true,
        vehicle: true,
        payment: true,
      },
    });

    return updated;
  }

  private calculatePrice(dailyRate: number, durationDays: number, startDate: Date, endDate: Date, priceRules: any[]) {
    let subtotal = dailyRate * durationDays;
    let discountAmount = 0;
    let extraAmount = 0;

    const dayOfWeek = startDate.getDay();
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();

    for (const rule of priceRules) {
      let applies = false;

      if (rule.type === 'LONG_TERM' && durationDays >= rule.minDays) {
        applies = true;
      } else if (rule.type === 'WEEKEND' && (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0)) {
        applies = true;
      } else if (rule.type === 'SEASONAL') {
        const ruleStart = new Date(rule.startDate);
        const ruleEnd = new Date(rule.endDate);
        if (startDate <= ruleEnd && endDate >= ruleStart) {
          applies = true;
        }
      }

      if (applies) {
        if (rule.value < 0) {
          discountAmount = Math.max(discountAmount, Math.abs(rule.value) * subtotal / 100);
        } else {
          extraAmount = Math.max(extraAmount, rule.value * subtotal / 100);
        }
      }
    }

    const adjustedSubtotal = subtotal - discountAmount + extraAmount;
    const total = adjustedSubtotal;

    return {
      subtotal,
      discountAmount,
      extraAmount,
      total,
    };
  }
}
```

---

## 5.4 Controller Bookings

```typescript
// bookings/bookings.controller.ts
import {
  Controller, Get, Post, Put, Patch, Body, Param,
  UseGuards, Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { FilterBookingsDto } from './dto/filter-bookings.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createBooking(@CurrentUser() user: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(user.id, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyBookings(@CurrentUser() user: any, @Query() dto: FilterBookingsDto) {
    return this.bookingsService.getMyBookings(user.id, dto);
  }

  @Get('my/:id')
  @UseGuards(JwtAuthGuard)
  getMyBookingById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.getMyBookingById(user.id, parseInt(id));
  }

  @Post('my/:id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelMyBooking(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.cancelMyBooking(user.id, parseInt(id));
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAllBookings(@Query() dto: FilterBookingsDto) {
    return this.bookingsService.getAllBookings(dto);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getBookingById(@Param('id') id: string) {
    return this.bookingsService.getBookingById(parseInt(id));
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateBooking(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingsService.updateBooking(parseInt(id), dto);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateBookingStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.bookingsService.updateBookingStatus(parseInt(id), body.status);
  }
}
```

---

## 5.5 Module Bookings Configuration

```typescript
// bookings/bookings.module.ts
import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
```

---

# Module 6: Intégration Paiements

## 6.1 Modèle Prisma Payment

```prisma
model Payment {
  id               Int           @id @default(autoincrement())
  bookingId        Int           @unique
  amount           Float
  method           PaymentMethod
  gatewayId        String?
  gatewayResponse  Json?
  status           PaymentStatus @default(PENDING)
  refundedAmount   Float         @default(0)
  refundedAt       DateTime?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  
  booking          Booking       @relation(fields: [bookingId], references: [id])
}

enum PaymentMethod {
  PAYMEE
  STRIPE
  CASH
  BANK_TRANSFER
}
```

---

## 6.2 Service Paymee

```typescript
// payments/paymee/paymee.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymeeService {
  constructor(private config: ConfigService) {}

  async initiatePayment(params: {
    amount: number;
    bookingRef: string;
    bookingId: number;
    client: { firstName: string; lastName: string; email: string; phone: string };
  }) {
    const vendorToken = this.config.get('PAYMEE_VENDOR_TOKEN');
    const apiUrl = this.config.get('PAYMEE_API_URL');
    const appUrl = this.config.get('API_URL');
    const frontUrl = this.config.get('APP_URL');

    const payload = {
      vendor: vendorToken,
      amount: parseFloat(params.amount.toFixed(3)),
      note: `Location véhicule — ${params.bookingRef}`,
      first_name: params.client.firstName,
      last_name: params.client.lastName,
      email: params.client.email,
      phone: params.client.phone?.replace('+216', '') || '',
      return_url: `${frontUrl}/booking/success?ref=${params.bookingRef}`,
      cancel_url: `${frontUrl}/booking/cancel?ref=${params.bookingRef}`,
      webhook_url: `${appUrl}/api/v1/webhooks/paymee`,
      order_id: params.bookingId.toString(),
    };

    try {
      const response = await axios.post(`${apiUrl}/payments/create`, payload, {
        headers: {
          Authorization: `Token ${vendorToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.data?.data?.token) {
        throw new BadRequestException('Erreur création paiement Paymee');
      }

      return {
        token: response.data.data.token,
        paymentUrl: `https://app.paymee.tn/gateway/${response.data.data.token}`,
      };
    } catch (error) {
      throw new BadRequestException(`Paymee: ${error.message}`);
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = this.config.get('PAYMEE_WEBHOOK_SECRET');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  async refund(paymentToken: string, amount: number) {
    const vendorToken = this.config.get('PAYMEE_VENDOR_TOKEN');
    const apiUrl = this.config.get('PAYMEE_API_URL');

    await axios.post(
      `${apiUrl}/payments/refund`,
      { token: paymentToken, amount: parseFloat(amount.toFixed(3)) },
      { headers: { Authorization: `Token ${vendorToken}` } },
    );
  }
}
```

---

## 6.3 Service Stripe

```typescript
// payments/stripe/stripe.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private config: ConfigService) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-06-20',
    });
  }

  async createPaymentIntent(params: {
    amountTND: number;
    bookingRef: string;
    bookingId: number;
    clientEmail: string;
  }) {
    // Stripe ne supporte pas TND → facturation en EUR
    const EUR_RATE = 3.3;
    const amountInEurCents = Math.round((params.amountTND / EUR_RATE) * 100);

    const intent = await this.stripe.paymentIntents.create({
      amount: amountInEurCents,
      currency: 'eur',
      metadata: {
        booking_ref: params.bookingRef,
        booking_id: params.bookingId.toString(),
        amount_tnd: params.amountTND.toString(),
      },
      receipt_email: params.clientEmail,
      description: `Location véhicule — ${params.bookingRef}`,
    });

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    };
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async refund(paymentIntentId: string, amountTND?: number) {
    const params: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amountTND) {
      const EUR_RATE = 3.3;
      params.amount = Math.round((amountTND / EUR_RATE) * 100);
    }

    return this.stripe.refunds.create(params);
  }
}
```

---

## 6.4 Controller Webhooks

```typescript
// payments/webhooks/webhooks.controller.ts
import {
  Controller, Post, Body, Headers, RawBodyRequest,
  Req, HttpCode, Logger, BadRequestException,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PaymeeService } from '../paymee/paymee.service';
import { StripeService } from '../stripe/stripe.service';
import { PaymentsService } from '../payments.service';
import { BookingsService } from '../../bookings/bookings.service';
import { MailService } from '../../mail/mail.service';

@Controller('webhooks')
@Public()
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private paymeeService: PaymeeService,
    private stripeService: StripeService,
    private paymentsService: PaymentsService,
    private bookingsService: BookingsService,
    private mailService: MailService,
  ) {}

  @Post('paymee')
  @HttpCode(200)
  async handlePaymeeWebhook(
    @Body() body: any,
    @Headers('x-paymee-signature') signature: string,
  ) {
    const rawBody = JSON.stringify(body);

    if (!this.paymeeService.verifyWebhookSignature(rawBody, signature)) {
      this.logger.warn('⚠️ Signature Paymee invalide');
      throw new BadRequestException('Signature invalide');
    }

    this.logger.log(`📩 Webhook Paymee reçu: ${body.status} — Order: ${body.order_id}`);

    if (body.status === true || body.payment_status === 'SUCCESS') {
      await this.paymentsService.confirmByGatewayToken(body.token);
      const booking = await this.bookingsService.confirmByIdAndPay(
        parseInt(body.order_id),
        { method: 'PAYMEE', gatewayId: body.token, gatewayResponse: body },
      );
      await this.mailService.sendPaymentConfirmation(booking);
    }

    return { received: true };
  }

  @Post('stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: any;

    try {
      event = this.stripeService.constructWebhookEvent(req.rawBody as Buffer, signature);
    } catch (err) {
      this.logger.warn(`⚠️ Webhook Stripe invalide: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`📩 Webhook Stripe: ${event.type}`);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const bookingId = parseInt(intent.metadata.booking_id);

      await this.bookingsService.confirmByIdAndPay(bookingId, {
        method: 'STRIPE',
        gatewayId: intent.id,
        gatewayResponse: intent,
      });
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      this.logger.warn(`❌ Paiement échoué: ${intent.id}`);
      await this.paymentsService.markFailed(intent.id);
    }

    return { received: true };
  }
}
```

---

## 6.5 Service Payments

```typescript
// payments/payments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async confirmByGatewayToken(gatewayId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { gatewayId } });
    if (!payment) throw new NotFoundException('Paiement non trouvé');

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID' },
    });
    return payment;
  }

  async markFailed(gatewayId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { gatewayId } });
    if (!payment) throw new NotFoundException('Paiement non trouvé');

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });
  }

  async refundPayment(paymentId: number, amount?: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });
    if (!payment) throw new NotFoundException('Paiement non trouvé');

    const refundAmount = amount || payment.amount - payment.refundedAmount;

    // Appel remboursement selon méthode
    if (payment.method === 'PAYMEE') {
      // await this.paymeeService.refund(payment.gatewayId, refundAmount);
    } else if (payment.method === 'STRIPE') {
      // await this.stripeService.refund(payment.gatewayId, refundAmount);
    }

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        refundedAmount: { increment: refundAmount },
        refundedAt: new Date(),
        status: payment.refundedAmount + refundAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      },
    });

    return { message: 'Remboursement effectué', refundAmount };
  }

  async getAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        booking: {
          select: {
            bookingReference: true,
            client: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

---

## 6.6 Module Payments Configuration

```typescript
// payments/payments.module.ts
import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymeeService } from './paymee/paymee.service';
import { StripeService } from './stripe/stripe.service';
import { WebhooksController } from './webhooks/webhooks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { BookingsModule } from '../bookings/bookings.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, ConfigModule, BookingsModule, MailModule],
  controllers: [PaymentsController, WebhooksController],
  providers: [PaymentsService, PaymeeService, StripeService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
```

---

# Module 7: Règles de Tarification

## 7.1 Modèle Prisma PriceRule

```prisma
model PriceRule {
  id          Int          @id @default(autoincrement())
  name        String
  type        PriceRuleType
  value       Float
  minDays     Int?
  startDate   DateTime?
  endDate     DateTime?
  category    VehicleCategory?
  vehicleId   Int?
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  vehicle     Vehicle?     @relation(fields: [vehicleId], references: [id])
}

enum PriceRuleType {
  SEASONAL
  WEEKEND
  LONG_TERM
  PROMOTION
}
```

---

## 7.2 DTOs Pricing Module

### CreatePriceRuleDto
```typescript
// pricing/dto/create-price-rule.dto.ts
import { IsString, IsNumber, IsEnum, IsOptional, IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePriceRuleDto {
  @ApiProperty({ example: 'Été 2025' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['SEASONAL', 'WEEKEND', 'LONG_TERM', 'PROMOTION'] })
  @IsEnum(['SEASONAL', 'WEEKEND', 'LONG_TERM', 'PROMOTION'])
  type: string;

  @ApiProperty({ example: 20, description: 'Pourcentage (positif = majoration, négatif = remise)' })
  @IsNumber()
  value: number;

  @ApiProperty({ example: 7, required: false })
  @IsOptional()
  @IsInt()
  minDays?: number;

  @ApiProperty({ example: '2025-07-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2025-08-31', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ enum: ['ECONOMY', 'SEDAN', 'SUV', 'LUXURY', 'VAN'], required: false })
  @IsOptional()
  @IsEnum(['ECONOMY', 'SEDAN', 'SUV', 'LUXURY', 'VAN'])
  category?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  vehicleId?: number;
}
```

---

## 7.3 Service Pricing

```typescript
// pricing/pricing.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceRuleDto } from './dto/create-price-rule.dto';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async getAllPriceRules() {
    return this.prisma.priceRule.findMany({
      include: { vehicle: { select: { brand: true, model: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActivePriceRules() {
    return this.prisma.priceRule.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPriceRule(dto: CreatePriceRuleDto) {
    return this.prisma.priceRule.create({
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async updatePriceRule(id: number, dto: Partial<CreatePriceRuleDto>) {
    const rule = await this.prisma.priceRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Règle non trouvée');

    return this.prisma.priceRule.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async togglePriceRule(id: number) {
    const rule = await this.prisma.priceRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Règle non trouvée');

    return this.prisma.priceRule.update({
      where: { id },
      data: { isActive: !rule.isActive },
    });
  }

  async deletePriceRule(id: number) {
    const rule = await this.prisma.priceRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Règle non trouvée');

    await this.prisma.priceRule.delete({ where: { id } });
    return { message: 'Règle supprimée' };
  }
}
```

---

## 7.4 Module Pricing Configuration

```typescript
// pricing/pricing.module.ts
import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
```

---

# Module 8: Maintenance & Opérations

## 8.1 Modèle Prisma MaintenanceRecord

```prisma
model MaintenanceRecord {
  id            Int          @id @default(autoincrement())
  vehicleId     Int
  type          MaintenanceType
  title         String
  description   String?
  performedAt   DateTime?
  mileage       Int?
  cost          Float?
  provider      String?
  nextDueDate   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  vehicle       Vehicle      @relation(fields: [vehicleId], references: [id])
}

enum MaintenanceType {
  OIL_CHANGE
  TIRE_ROTATION
  BRAKE_SERVICE
  INSPECTION
  INSURANCE
  REGISTRATION
  REPAIR
  OTHER
}
```

---

## 8.2 DTOs Maintenance Module

### CreateMaintenanceDto
```typescript
// maintenance/dto/create-maintenance.dto.ts
import { IsString, IsInt, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaintenanceDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  vehicleId: number;

  @ApiProperty({ enum: ['OIL_CHANGE', 'TIRE_ROTATION', 'BRAKE_SERVICE', 'INSPECTION', 'INSURANCE', 'REGISTRATION', 'REPAIR', 'OTHER'] })
  @IsEnum(['OIL_CHANGE', 'TIRE_ROTATION', 'BRAKE_SERVICE', 'INSPECTION', 'INSURANCE', 'REGISTRATION', 'REPAIR', 'OTHER'])
  type: string;

  @ApiProperty({ example: 'Vidange régulière' })
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2025-01-15', required: false })
  @IsOptional()
  @IsDateString()
  performedAt?: string;

  @ApiProperty({ example: 25000, required: false })
  @IsOptional()
  @IsInt()
  mileage?: number;

  @ApiProperty({ example: 150.0, required: false })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({ example: 'Auto Service Tunis', required: false })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({ example: '2025-07-15', required: false })
  @IsOptional()
  @IsDateString()
  nextDueDate?: string;
}
```

---

## 8.3 Service Maintenance

```typescript
// maintenance/maintenance.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async getAllMaintenanceRecords(vehicleId?: number) {
    const where = vehicleId ? { vehicleId } : {};
    return this.prisma.maintenanceRecord.findMany({
      where,
      include: {
        vehicle: { select: { brand: true, model: true, registration: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMaintenanceAlerts() {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const records = await this.prisma.maintenanceRecord.findMany({
      where: {
        nextDueDate: {
          lte: thirtyDaysLater,
        },
      },
      include: {
        vehicle: { select: { brand: true, model: true, registration: true, status: true } },
      },
      orderBy: { nextDueDate: 'asc' },
    });

    return records.map(r => ({
      ...r,
      urgency: this.calculateUrgency(r.nextDueDate, today),
    }));
  }

  async getVehicleMaintenanceHistory(vehicleId: number) {
    return this.prisma.maintenanceRecord.findMany({
      where: { vehicleId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMaintenanceRecord(dto: CreateMaintenanceDto) {
    const record = await this.prisma.maintenanceRecord.create({
      data: {
        ...dto,
        performedAt: dto.performedAt ? new Date(dto.performedAt) : undefined,
        nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : undefined,
      },
      include: { vehicle: true },
    });

    // Mettre véhicule en maintenance si nécessaire
    if (dto.type === 'REPAIR') {
      await this.prisma.vehicle.update({
        where: { id: dto.vehicleId },
        data: { status: 'MAINTENANCE' },
      });
    }

    return record;
  }

  async updateMaintenanceRecord(id: number, dto: Partial<CreateMaintenanceDto>) {
    const record = await this.prisma.maintenanceRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Enregistrement non trouvé');

    return this.prisma.maintenanceRecord.update({
      where: { id },
      data: {
        ...dto,
        performedAt: dto.performedAt ? new Date(dto.performedAt) : undefined,
        nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : undefined,
      },
    });
  }

  async deleteMaintenanceRecord(id: number) {
    const record = await this.prisma.maintenanceRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Enregistrement non trouvé');

    await this.prisma.maintenanceRecord.delete({ where: { id } });
    return { message: 'Enregistrement supprimé' };
  }

  private calculateUrgency(nextDueDate: Date, today: Date): string {
    const daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 0) return 'EXPIRED';
    if (daysUntilDue <= 1) return 'CRITICAL';
    if (daysUntilDue <= 7) return 'HIGH';
    return 'NORMAL';
  }
}
```

---

## 8.4 Module Maintenance Configuration

```typescript
// maintenance/maintenance.module.ts
import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
```

---

# Module 9: Dashboard & Analytics

## 9.1 Service Dashboard

```typescript
// dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKPIs() {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Revenus ce mois
    const currentMonthRevenue = await this.prisma.booking.aggregate({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { totalAmount: true },
    });

    // Revenus mois dernier
    const lastMonthRevenue = await this.prisma.booking.aggregate({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { totalAmount: true },
    });

    // Réservations ce mois
    const currentMonthBookings = await this.prisma.booking.count({
      where: { createdAt: { gte: monthStart, lte: monthEnd } },
    });

    // Véhicules disponibles
    const availableVehicles = await this.prisma.vehicle.count({
      where: { status: 'AVAILABLE' },
    });

    // Total véhicules
    const totalVehicles = await this.prisma.vehicle.count();

    // Clients actifs
    const activeClients = await this.prisma.user.count({
      where: { isActive: true, role: 'CLIENT' },
    });

    const currentRevenue = currentMonthRevenue._sum.totalAmount || 0;
    const lastRevenue = lastMonthRevenue._sum.totalAmount || 0;
    const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    return {
      revenue: {
        current: currentRevenue,
        change: revenueChange,
      },
      bookings: {
        current: currentMonthBookings,
      },
      vehicles: {
        available: availableVehicles,
        total: totalVehicles,
        occupancyRate: totalVehicles > 0 ? ((totalVehicles - availableVehicles) / totalVehicles) * 100 : 0,
      },
      clients: activeClients,
    };
  }

  async getRevenueByMonth(months: number = 12) {
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const revenue = await this.prisma.booking.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { totalAmount: true },
      });

      data.push({
        month: format(date, 'MMM yyyy'),
        revenue: revenue._sum.totalAmount || 0,
      });
    }
    return data;
  }

  async getBookingsByStatus() {
    const statuses = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    const data = [];

    for (const status of statuses) {
      const count = await this.prisma.booking.count({ where: { status } });
      data.push({ status, count });
    }

    return data;
  }

  async getFleetOccupancy(days: number = 30) {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const rentedVehicles = await this.prisma.booking.count({
        where: {
          status: { in: ['CONFIRMED', 'ACTIVE'] },
          startDate: { lte: dayEnd },
          endDate: { gte: dayStart },
        },
      });

      const totalVehicles = await this.prisma.vehicle.count();
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        rented: rentedVehicles,
        total: totalVehicles,
        occupancyRate: totalVehicles > 0 ? (rentedVehicles / totalVehicles) * 100 : 0,
      });
    }

    return data;
  }

  async getTopVehicles(limit: number = 5) {
    const vehicles = await this.prisma.vehicle.findMany({
      include: {
        _count: { select: { bookings: true } },
        bookings: {
          select: { totalAmount: true },
        },
      },
    });

    const withRevenue = vehicles.map(v => ({
      ...v,
      revenue: v.bookings.reduce((sum, b) => sum + b.totalAmount, 0),
    }));

    return withRevenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
      .map(v => ({
        id: v.id,
        brand: v.brand,
        model: v.model,
        registration: v.registration,
        bookingsCount: v._count.bookings,
        revenue: v.revenue,
      }));
  }

  async getPaymentMethodsDistribution() {
    const payments = await this.prisma.payment.groupBy({
      by: ['method'],
      _count: true,
      _sum: { amount: true },
    });

    return payments.map(p => ({
      method: p.method,
      count: p._count,
      amount: p._sum.amount || 0,
    }));
  }
}
```

---

## 9.2 Module Dashboard Configuration

```typescript
// dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
```

---

# Module 10: Système de Notifications

## 10.1 Modèle Prisma Notification

```prisma
model Notification {
  id        Int      @id @default(autoincrement())
  userId    Int
  type      String
  title     String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## 10.2 Service Notifications

```typescript
// notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { userId: number; type: string; title: string; message: string }) {
    return this.prisma.notification.create({
      data,
    });
  }

  async getUserNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification non trouvée');

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'Toutes les notifications marquées comme lues' };
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }
}
```

---

## 10.3 Module Notifications Configuration

```typescript
// notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

---

# Module 11: Services Email & PDF

## 11.1 Service Mail

```typescript
// mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private config: ConfigService,
  ) {}

  async sendWelcome(email: string, firstName: string, verifyToken: string) {
    const verifyUrl = `${this.config.get('API_URL')}/api/v1/auth/verify-email?token=${verifyToken}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Bienvenue sur Car Rental',
      template: './welcome',
      context: {
        firstName,
        verifyUrl,
      },
    });
  }

  async sendPasswordReset(email: string, firstName: string, resetToken: string) {
    const resetUrl = `${this.config.get('APP_URL')}/reset-password?token=${resetToken}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Réinitialisation de mot de passe',
      template: './reset-password',
      context: {
        firstName,
        resetUrl,
      },
    });
  }

  async sendBookingConfirmation(booking: any) {
    await this.mailerService.sendMail({
      to: booking.client.email,
      subject: `Confirmation de réservation ${booking.bookingReference}`,
      template: './booking-confirmation',
      context: {
        firstName: booking.client.firstName,
        bookingReference: booking.bookingReference,
        vehicle: booking.vehicle,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: booking.totalAmount,
      },
    });
  }

  async sendPaymentConfirmation(booking: any) {
    await this.mailerService.sendMail({
      to: booking.client.email,
      subject: `Paiement confirmé - ${booking.bookingReference}`,
      template: './payment-confirmation',
      context: {
        firstName: booking.client.firstName,
        bookingReference: booking.bookingReference,
        totalAmount: booking.totalAmount,
      },
    });
  }

  async sendBookingReminder(booking: any) {
    await this.mailerService.sendMail({
      to: booking.client.email,
      subject: `Rappel : Votre location commence demain`,
      template: './booking-reminder',
      context: {
        firstName: booking.client.firstName,
        vehicle: booking.vehicle,
        startDate: booking.startDate,
        pickupTime: booking.pickupTime,
      },
    });
  }
}
```

---

## 11.2 Module Mail Configuration

```typescript
// mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get('MAIL_FROM'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
```

---

## 11.3 Service PDF

```typescript
// pdf/pdf.service.ts
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  async generateContract(booking: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // En-tête
      doc.fontSize(20).text('CONTRAT DE LOCATION', { align: 'center' });
      doc.moveDown();

      // Informations client
      doc.fontSize(12).text('CLIENT:');
      doc.text(`Nom: ${booking.client.firstName} ${booking.client.lastName}`);
      doc.text(`Email: ${booking.client.email}`);
      doc.text(`Téléphone: ${booking.client.phone}`);
      doc.text(`CIN: ${booking.client.cin}`);
      doc.moveDown();

      // Informations véhicule
      doc.text('VÉHICULE:');
      doc.text(`${booking.vehicle.brand} ${booking.vehicle.model}`);
      doc.text(`Immatriculation: ${booking.vehicle.registration}`);
      doc.moveDown();

      // Détails location
      doc.text('DÉTAILS DE LA LOCATION:');
      doc.text(`Référence: ${booking.bookingReference}`);
      doc.text(`Date début: ${booking.startDate.toLocaleDateString()}`);
      doc.text(`Date fin: ${booking.endDate.toLocaleDateString()}`);
      doc.text(`Montant total: ${booking.totalAmount} TND`);
      doc.moveDown();

      // Signature
      doc.text('Signatures:', { continued: true });
      doc.text('', { continued: false });
      doc.text('Client: _________________    Agence: _________________');

      doc.end();
    });
  }
}
```

---

# Module 12: Upload & Stockage Fichiers

## 12.1 Service Upload

```typescript
// upload/upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadService {
  private readonly uploadPath = './uploads';
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxSize = 5 * 1024 * 1024; // 5MB

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Type de fichier non autorisé');
    }
    if (file.size > this.maxSize) {
      throw new BadRequestException('Fichier trop volumineux (max 5MB)');
    }

    const filename = `${uuidv4()}.webp`;
    const filepath = join(this.uploadPath, filename);

    // Optimiser image
    await sharp(file.buffer)
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(filepath);

    return `/uploads/${filename}`;
  }

  async deleteImage(url: string): Promise<void> {
    const filename = url.split('/').pop();
    const filepath = join(this.uploadPath, filename);
    await fs.unlink(filepath);
  }
}
```

---

# Module 13: Scheduler & Tâches Planifiées

## 13.1 Service Scheduler

```typescript
// scheduler/scheduler.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkMaintenanceAlerts() {
    this.logger.log('🔧 Vérification des alertes de maintenance...');

    const alertThresholds = [30, 7, 1, 0];
    const today = new Date();

    for (const days of alertThresholds) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const dateStr = targetDate.toISOString().split('T')[0];

      const records = await this.prisma.maintenanceRecord.findMany({
        where: {
          nextDueDate: {
            gte: new Date(`${dateStr}T00:00:00`),
            lt: new Date(`${dateStr}T23:59:59`),
          },
        },
        include: {
          vehicle: { select: { brand: true, model: true, registration: true } },
        },
      });

      for (const record of records) {
        const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (!admin) continue;

        const label = days === 0 ? 'EXPIRÉE AUJOURD\'HUI' : `dans ${days} jour(s)`;
        const urgency = days === 0 ? '🔴' : days <= 7 ? '🟠' : '🟡';

        await this.notifications.create({
          userId: admin.id,
          type: 'MAINTENANCE_ALERT',
          title: `${urgency} Maintenance ${label}`,
          message: `${record.type} — ${record.vehicle.brand} ${record.vehicle.model} (${record.vehicle.registration}) : ${record.title}`,
        });
      }
    }

    this.logger.log('✅ Vérification alertes terminée');
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendBookingReminders() {
    this.logger.log('📅 Envoi rappels réservations J-1...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        startDate: {
          gte: new Date(`${tomorrowStr}T00:00:00`),
          lt: new Date(`${tomorrowStr}T23:59:59`),
        },
      },
      include: {
        client: { select: { firstName: true, email: true } },
        vehicle: { select: { brand: true, model: true, registration: true } },
      },
    });

    for (const booking of bookings) {
      await this.mailService.sendBookingReminder(booking);
      this.logger.log(`📧 Rappel envoyé à ${booking.client.email} pour ${booking.bookingReference}`);
    }
  }
}
```

---

## 13.2 Module Scheduler Configuration

```typescript
// scheduler/scheduler.module.ts
import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, NotificationsModule, MailModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
```

---

# Référence API Endpoints

## Authentification

| Méthode | Endpoint | Access | Description |
|---------|----------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Inscription client |
| POST | `/api/v1/auth/login` | Public | Connexion → tokens |
| POST | `/api/v1/auth/refresh` | Public | Renouveler access token |
| POST | `/api/v1/auth/logout` | Auth | Invalidation refresh token |
| GET | `/api/v1/auth/verify-email` | Public | Vérification email |
| POST | `/api/v1/auth/forgot-password` | Public | Demande reset MDP |
| POST | `/api/v1/auth/reset-password` | Public | Reset MDP |

## Utilisateurs

| Méthode | Endpoint | Access | Description |
|---------|----------|--------|-------------|
| GET | `/api/v1/users/me` | Client | Mon profil complet |
| PUT | `/api/v1/users/me` | Client | Modifier mon profil |
| PATCH | `/api/v1/users/me/password` | Client | Changer mot de passe |
| GET | `/api/v1/users/me/stats` | Client | Mes statistiques |
| GET | `/api/v1/users/admin` | Admin | Liste tous clients |
| GET | `/api/v1/users/admin/:id` | Admin | Fiche client détaillée |
| PATCH | `/api/v1/users/admin/:id/status` | Admin | Activer / Bloquer |

## Véhicules

| Méthode | Endpoint | Access | Description |
|---------|----------|--------|-------------|
| GET | `/api/v1/vehicles` | Public | Liste + filtres + pagination |
| GET | `/api/v1/vehicles/:id` | Public | Détail + galerie |
| GET | `/api/v1/vehicles/:id/availability` | Public | Dates bloquées calendrier |
| GET | `/api/v1/vehicles/categories/list` | Public | Liste catégories |
| POST | `/api/v1/vehicles/availability/check` | Public | Vérifier disponibilité |
| POST | `/api/v1/vehicles/admin` | Admin | Créer véhicule |
| PUT | `/api/v1/vehicles/admin/:id` | Admin | Modifier véhicule |
| DELETE | `/api/v1/vehicles/admin/:id` | Admin | Supprimer véhicule |
| PATCH | `/api/v1/vehicles/admin/:id/status` | Admin | Changer statut |

## Réservations

| Méthode | Endpoint | Access | Description |
|---------|----------|--------|-------------|
| POST | `/api/v1/bookings` | Client | Créer réservation |
| GET | `/api/v1/bookings/my` | Client | Mes réservations |
| GET | `/api/v1/bookings/my/:id` | Client | Détail ma réservation |
| POST | `/api/v1/bookings/my/:id/cancel` | Client | Annuler ma réservation |
| GET | `/api/v1/bookings/admin` | Admin | Toutes réservations |
| GET | `/api/v1/bookings/admin/:id` | Admin | Détail réservation |
| PUT | `/api/v1/bookings/admin/:id` | Admin | Modifier réservation |
| PATCH | `/api/v1/bookings/admin/:id/status` | Admin | Changer statut |

## Paiements

| Méthode | Endpoint | Access | Description |
|---------|----------|--------|-------------|
| POST | `/api/v1/payments/paymee/initiate` | Client | Initier Paymee → URL |
| POST | `/api/v1/payments/stripe/create-intent` | Client | Créer Stripe Intent |
| POST | `/api/v1/webhooks/paymee` | Public* | Webhook Paymee |
| POST | `/api/v1/webhooks/stripe` | Public* | Webhook Stripe |
| GET | `/api/v1/payments/admin` | Admin | Toutes transactions |
| POST | `/api/v1/payments/admin/:id/refund` | Admin | Rembourser |

## Maintenance

| Méthode | Endpoint | Access | Description |
|---------|----------|--------|-------------|
| GET | `/api/v1/maintenance/admin` | Admin | Toutes maintenances |
| GET | `/api/v1/maintenance/admin/alerts` | Admin | Alertes < 30 jours |
| GET | `/api/v1/maintenance/admin/vehicle/:id` | Admin | Historique véhicule |
| POST | `/api/v1/maintenance/admin` | Admin | Ajouter entretien |
| PUT | `/api/v1/maintenance/admin/:id` | Admin | Modifier |
| DELETE | `/api/v1/maintenance/admin/:id` | Admin | Supprimer |

## Dashboard

| Méthode | Endpoint | Access | Description |
|---------|----------|--------|-------------|
| GET | `/api/v1/dashboard/admin/kpis` | Admin | KPIs principaux |
| GET | `/api/v1/dashboard/admin/revenue` | Admin | Revenus mensuels |
| GET | `/api/v1/dashboard/admin/bookings-status` | Admin | Par statut |
| GET | `/api/v1/dashboard/admin/fleet-occupation` | Admin | Taux occupation |
| GET | `/api/v1/dashboard/admin/top-vehicles` | Admin | Top véhicules |
| GET | `/api/v1/dashboard/admin/payment-methods` | Admin | Méthodes paiement |

## Notifications

| Méthode | Endpoint | Access | Description |
|---------|----------|--------|-------------|
| GET | `/api/v1/notifications` | Client/Admin | Mes notifications |
| PATCH | `/api/v1/notifications/:id/read` | Client/Admin | Marquer comme lu |
| PATCH | `/api/v1/notifications/read-all` | Client/Admin | Tout marquer lu |
| GET | `/api/v1/notifications/unread-count` | Client/Admin | Compteur non lus |

## Tarification

| Méthode | Endpoint | Access | Description |
|---------|----------|--------|-------------|
| GET | `/api/v1/pricing/admin` | Admin | Règles tarifaires |
| POST | `/api/v1/pricing/admin` | Admin | Créer règle |
| PUT | `/api/v1/pricing/admin/:id` | Admin | Modifier règle |
| PATCH | `/api/v1/pricing/admin/:id/toggle` | Admin | Activer/Désactiver |
| DELETE | `/api/v1/pricing/admin/:id` | Admin | Supprimer règle |

---

# Règles Métier

## Disponibilité Véhicule

Un véhicule est INDISPONIBLE pour une période [startDate, endDate] si :
1. Il a une réservation status IN (CONFIRMED, ACTIVE) avec dates qui chevauchent
2. Son status est MAINTENANCE ou OUT_OF_SERVICE

Query de chevauchement Prisma :
```prisma
where: {
  vehicleId,
  status: { in: ['CONFIRMED', 'ACTIVE'] },
  startDate: { lt: endDate },
  endDate: { gt: startDate },
}
```

## Calcul Prix

1. Prix de base = vehicle.dailyRate × durationDays
2. Appliquer les règles prix actives (PriceRule)
3. Prix ajusté/jour = dailyRate × (1 + extraPct/100) × (1 - discountPct/100)
4. Subtotal = Prix ajusté × durationDays
5. Total = subtotal + depositAmount

## Politique d'Annulation

- Annulation > 48h avant départ → Remboursement 100%
- Annulation 24h–48h avant → Remboursement 70%
- Annulation < 24h avant → Remboursement 50%
- No-show → Remboursement 0%

## Machine d'État Réservation

```
PENDING ──────────────────────────► CONFIRMED ──────────► ACTIVE ──────► COMPLETED
   │         (admin confirme              │                                       │
   │          ou paiement reçu)           │                                       │
   ▼                                      ▼                                       │
CANCELLED ◄─────────────────────── CANCELLED                                     │
(admin ou                                                                         │
 client avant)                                                              NO_SHOW
```

## Notifications Automatiques

| Événement | Destinataire | Canal | Délai |
|-----------|-------------|-------|-------|
| Inscription | Client | Email | Immédiat |
| Réservation créée | Client + Admin | Email + Notif | Immédiat |
| Paiement confirmé | Client | Email | Immédiat |
| Rappel prise en charge | Client | Email | J-1 à 10h |
| Maintenance échéance | Admin | Notif | J-30, J-7, J-1, J-0 |

---

*Fin du document de spécification backend*

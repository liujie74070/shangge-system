import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { StoresModule } from './modules/stores/stores.module';
import { ConfigModule } from './modules/config/config.module';
import { CustomersModule } from './modules/customers/customers.module';
import { FollowUpsModule } from './modules/follow-ups/follow-ups.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { VisitsModule } from './modules/visits/visits.module';
import { MeasurementsModule } from './modules/measurements/measurements.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ChurnsModule } from './modules/churns/churns.module';
import { ConstructionsModule } from './modules/constructions/constructions.module';
import { AfterSalesModule } from './modules/after-sales/after-sales.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UploadModule } from './modules/upload/upload.module';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    StoresModule,
    ConfigModule,
    CustomersModule,
    FollowUpsModule,
    AppointmentsModule,
    VisitsModule,
    MeasurementsModule,
    ProposalsModule,
    ContractsModule,
    PaymentsModule,
    ChurnsModule,
    ConstructionsModule,
    AfterSalesModule,
    ReferralsModule,
    DashboardModule,
    UploadModule,
    ActivityLogModule,
    NotificationsModule,
  ],
})
export class AppModule {}

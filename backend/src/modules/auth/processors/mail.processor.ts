import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { MailService } from "@/modules/mail/mail.service";
import { MAIL_JOB_NAME } from "@/common/constants/event.constant";
import { QUEUE_NAMES } from "@/common/constants/queue.constants";

@Processor(QUEUE_NAMES.MAIL)
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(
    job: Job<{ email: string; fullName: string; token: string }>,
  ): Promise<void> {
    const { email, fullName, token } = job.data;
    this.logger.debug(`Processing mail job: ${job.name}`);
    // WHY: Route to the appropriate email sending method based on BullMQ job name.
    switch (job.name) {
      case MAIL_JOB_NAME.SEND_VERIFICATION:
        await this.mailService.sendVerificationEmail(email, fullName, token);
        break;
      case MAIL_JOB_NAME.SEND_RESET_PASSWORD:
        await this.mailService.sendPasswordResetEmail(email, fullName, token);
        break;
      default:
        throw new Error(`Unsupported mail job name: ${job.name}`);
    }
  }
}

import { transports, createLogger, format } from 'winston'

export class Logger {

    public static error(message: string) {
        this.logger.error(message)
    }

    public static warn(message: string) {
        this.logger.warn(message)
    }

    public static info(message: string) {
        this.logger.info(message)
    }

    public static verbose(message: string) {
        this.logger.verbose(message)
    }

    public static debug(message: string) {
        this.logger.debug(message)
    }

    public static silly(message: string) {
        this.logger.silly(message)
    }

    private static readonly logger = createLogger({
        format: format.combine(
            format.splat(),
            format.simple(),
        ),
        transports: [
            new transports.Console(),
        ],
    })

}

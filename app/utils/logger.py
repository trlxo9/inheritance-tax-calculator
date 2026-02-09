import logging
import colorlog


def get_logger(name):
    # Create a logger or get it if it already exists
    logger = logging.getLogger(name)

    # Prevent adding handlers if the logger already has them
    if not logger.hasHandlers():
        # Set the log level
        logger.setLevel(logging.INFO)

        # Prevent the logger from propagating messages to the root logger
        logger.propagate = False

        # Create a handler
        handler = colorlog.StreamHandler()

        # Check if the output stream is a terminal
        if handler.stream.isatty():
            # Use the colored formatter
            formatter = colorlog.ColoredFormatter(
                "%(log_color)s%(levelname)s:%(name)s: %(message)s%(reset)s",
                datefmt="%Y-%m-%d %H:%M:%S",
                reset=True,
                log_colors={
                    "DEBUG": "cyan",
                    "INFO": "white",
                    "WARNING": "yellow",
                    "ERROR": "red",
                    "CRITICAL": "red,bg_white",
                },
                secondary_log_colors={},
                style="%",
            )
        else:
            # Use a standard formatter
            formatter = logging.Formatter(
                "%(asctime)s %(levelname)s:%(name)s: %(message)s",
                datefmt="%Y-%m-%dT%H:%M:%S.%f%z",
            )

        # Set the formatter for the handler
        handler.setFormatter(formatter)

        # Add the handler to the logger
        logger.addHandler(handler)

    return logger

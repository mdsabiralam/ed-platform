import torch
import logging

logger = logging.getLogger(__name__)

def check_cuda():
    """
    Checks if CUDA is available and logs the device type.
    """
    if torch.cuda.is_available():
        device = torch.device("cuda")
        logger.info(f"CUDA is available. Using GPU: {torch.cuda.get_device_name(0)}")
    else:
        device = torch.device("cpu")
        logger.info("CUDA not available. Using CPU.")

    return device

# Initialize on import
device = check_cuda()

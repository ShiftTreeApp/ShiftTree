"""Contains all the data models used in inputs/outputs"""

from .credentials import Credentials
from .error import Error
from .get_schedules_role_item import GetSchedulesRoleItem
from .get_shift_tree_code_existing_response_200 import GetShiftTreeCodeExistingResponse200
from .get_shift_tree_code_generate_response_200 import GetShiftTreeCodeGenerateResponse200
from .post_register_response_201 import PostRegisterResponse201
from .post_schedules_body import PostSchedulesBody
from .post_schedules_response_201 import PostSchedulesResponse201
from .post_signups_shift_id_body import PostSignupsShiftIdBody
from .put_shifts_shift_id_body import PutShiftsShiftIdBody
from .registration_credentials import RegistrationCredentials
from .schedule_info_preview import ScheduleInfoPreview
from .schedule_info_preview_role import ScheduleInfoPreviewRole
from .schedule_info_preview_state import ScheduleInfoPreviewState
from .shift_create_info import ShiftCreateInfo
from .shift_info import ShiftInfo
from .signup_info import SignupInfo
from .unexpected_error import UnexpectedError
from .user import User
from .user_info_preview import UserInfoPreview

__all__ = (
    "Credentials",
    "Error",
    "GetSchedulesRoleItem",
    "GetShiftTreeCodeExistingResponse200",
    "GetShiftTreeCodeGenerateResponse200",
    "PostRegisterResponse201",
    "PostSchedulesBody",
    "PostSchedulesResponse201",
    "PostSignupsShiftIdBody",
    "PutShiftsShiftIdBody",
    "RegistrationCredentials",
    "ScheduleInfoPreview",
    "ScheduleInfoPreviewRole",
    "ScheduleInfoPreviewState",
    "ShiftCreateInfo",
    "ShiftInfo",
    "SignupInfo",
    "UnexpectedError",
    "User",
    "UserInfoPreview",
)

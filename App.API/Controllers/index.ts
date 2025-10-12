// Import all controllers so TSOA can scan them for decorators
// Using explicit imports since TSOA needs them at compile time
import './Authentication/AuthenticationController';
import './Company/CompanyController';
import './Company/CompanySettingsController';
import './Company/LeaveRequestController';
import './Company/TeamController';
import './Permissions/PermissionController';
import './Roles/RoleController';
import './System/SystemController';
import './Timesheet/ActionCodeController';
import './Timesheet/TimesheetController';
import './Timesheet/TimesheetApprovalController';
import './Timesheet/TimesheetEntryController';
import './Timesheet/TimesheetHistoryController';
import './Users/ActiveSessionsController';
import './Users/RolePermissionController';
import './Users/UserController';
import './Users/UserStatusController';

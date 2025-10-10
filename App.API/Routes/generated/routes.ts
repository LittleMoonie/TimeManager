/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from './../../Controllers/Users/UserController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TimesheetHistoryController } from './../../Controllers/Timesheet/TimesheetHistoryController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TimesheetController } from './../../Controllers/Timesheet/TimesheetController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ActionCodeController } from './../../Controllers/Timesheet/ActionCodeController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SystemController } from './../../Controllers/System/SystemController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LeaveRequestController } from './../../Controllers/Company/LeaveRequestController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthenticationController } from './../../Controllers/Authentication/AuthenticationController';
import { expressAuthentication } from './../../Config/Auth';
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';

const expressAuthenticationRecasted = expressAuthentication as (req: ExRequest, securityName: string, scopes?: string[], res?: ExResponse) => Promise<any>;


// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "UserResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "orgId": {"dataType":"string","required":true},
            "role": {"dataType":"string","required":true},
            "status": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "phone": {"dataType":"string"},
            "lastLogin": {"dataType":"datetime"},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApiResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "msg": {"dataType":"string","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Role": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "rolePermissions": {"dataType":"array","array":{"dataType":"refObject","ref":"RolePermission"},"required":true},
            "users": {"dataType":"array","array":{"dataType":"refObject","ref":"User"},"required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RolePermission": {
        "dataType": "refObject",
        "properties": {
            "roleId": {"dataType":"string","required":true},
            "permissionId": {"dataType":"string","required":true},
            "role": {"ref":"Role","required":true},
            "permission": {"ref":"Permission","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Permission": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "rolePermissions": {"dataType":"array","array":{"dataType":"refObject","ref":"RolePermission"},"required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "User": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "orgId": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
            "role": {"ref":"Role","required":true},
            "roleId": {"dataType":"string","required":true},
            "phone": {"dataType":"string"},
            "lastLogin": {"dataType":"datetime"},
            "status": {"ref":"UserStatus","required":true},
            "statusId": {"dataType":"string","required":true},
            "organization": {"ref":"Organization","required":true},
            "timesheetHistory": {"dataType":"array","array":{"dataType":"refObject","ref":"TimesheetHistory"},"required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserStatus": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"string"},
            "users": {"dataType":"array","array":{"dataType":"refObject","ref":"User"},"required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Organization": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "name": {"dataType":"string","required":true},
            "users": {"dataType":"array","array":{"dataType":"refObject","ref":"User"},"required":true},
            "teams": {"dataType":"array","array":{"dataType":"refObject","ref":"Team"},"required":true},
            "actionCodes": {"dataType":"array","array":{"dataType":"refObject","ref":"ActionCode"},"required":true},
            "timesheetEntries": {"dataType":"array","array":{"dataType":"refObject","ref":"TimesheetEntry"},"required":true},
            "teamMembers": {"dataType":"array","array":{"dataType":"refObject","ref":"TeamMember"},"required":true},
            "timesheetHistory": {"dataType":"array","array":{"dataType":"refObject","ref":"TimesheetHistory"},"required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Team": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "orgId": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "organization": {"ref":"Organization","required":true},
            "members": {"dataType":"array","array":{"dataType":"refObject","ref":"TeamMember"},"required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TeamMember": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "userId": {"dataType":"string","required":true},
            "teamId": {"dataType":"string","required":true},
            "orgId": {"dataType":"string","required":true},
            "role": {"dataType":"string","required":true},
            "user": {"ref":"User","required":true},
            "team": {"ref":"Team","required":true},
            "organization": {"ref":"Organization","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActionCodeType": {
        "dataType": "refEnum",
        "enums": ["billable","non-billable"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActionCode": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "orgId": {"dataType":"string","required":true},
            "organization": {"ref":"Organization","required":true},
            "code": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "type": {"ref":"ActionCodeType","required":true},
            "active": {"dataType":"boolean","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "WorkMode": {
        "dataType": "refEnum",
        "enums": ["office","remote","hybrid"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimesheetEntry": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "userId": {"dataType":"string","required":true},
            "user": {"ref":"User","required":true},
            "orgId": {"dataType":"string","required":true},
            "organization": {"ref":"Organization","required":true},
            "actionCodeId": {"dataType":"string","required":true},
            "actionCode": {"ref":"ActionCode","required":true},
            "workMode": {"ref":"WorkMode","required":true},
            "country": {"dataType":"string","required":true},
            "startedAt": {"dataType":"datetime"},
            "endedAt": {"dataType":"datetime"},
            "durationMin": {"dataType":"double","required":true},
            "note": {"dataType":"string"},
            "day": {"dataType":"datetime","required":true},
            "approvals": {"dataType":"array","array":{"dataType":"refObject","ref":"Approval"},"required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ApprovalStatus": {
        "dataType": "refEnum",
        "enums": ["pending","approved","rejected"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Approval": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "orgId": {"dataType":"string","required":true},
            "organization": {"ref":"Organization","required":true},
            "entryId": {"dataType":"string","required":true},
            "entry": {"ref":"TimesheetEntry","required":true},
            "approverId": {"dataType":"string","required":true},
            "approver": {"ref":"User","required":true},
            "status": {"ref":"ApprovalStatus","required":true},
            "reason": {"dataType":"string"},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimesheetHistoryEntityTypeEnum": {
        "dataType": "refEnum",
        "enums": ["TimesheetEntry","TimesheetWeek","Approval","Permit"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimesheetHistoryActionEnum": {
        "dataType": "refEnum",
        "enums": ["created","updated","deleted","submitted","approved","rejected","auto_sent","permit_granted","permit_revoked","retro_edit_enabled","retro_edit_disabled"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimesheetStatus": {
        "dataType": "refEnum",
        "enums": ["DRAFT","SUBMITTED","APPROVED","REJECTED"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimesheetHistory": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "orgId": {"dataType":"string","required":true},
            "organization": {"ref":"Organization","required":true},
            "userId": {"dataType":"string","required":true},
            "user": {"ref":"User","required":true},
            "entityType": {"ref":"TimesheetHistoryEntityTypeEnum","required":true},
            "entityId": {"dataType":"string","required":true},
            "action": {"ref":"TimesheetHistoryActionEnum","required":true},
            "actorUserId": {"dataType":"string"},
            "actorUser": {"ref":"User"},
            "reason": {"dataType":"string"},
            "diff": {"dataType":"object"},
            "metadata": {"dataType":"object"},
            "occurredAt": {"dataType":"datetime","required":true},
            "weekStart": {"dataType":"string","required":true},
            "weekEnd": {"dataType":"string","required":true},
            "totalHours": {"dataType":"string","required":true},
            "country": {"dataType":"string","required":true},
            "location": {"dataType":"string","required":true},
            "notes": {"dataType":"string"},
            "status": {"ref":"TimesheetStatus","required":true},
            "hash": {"dataType":"string"},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateUserDto": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
            "role": {"ref":"Role","required":true},
            "orgId": {"dataType":"string"},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateUserDto": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string"},
            "name": {"dataType":"string"},
            "password": {"dataType":"string"},
            "role": {"ref":"Role"},
            "status": {"ref":"UserStatus"},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IRecordOfAny": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimesheetHistoryDto": {
        "dataType": "refObject",
        "properties": {
            "entityType": {"ref":"TimesheetHistoryEntityTypeEnum","required":true},
            "entityId": {"dataType":"string","required":true},
            "action": {"ref":"TimesheetHistoryActionEnum","required":true},
            "userId": {"dataType":"string","required":true},
            "reason": {"dataType":"string"},
            "diff": {"ref":"IRecordOfAny"},
            "startedAt": {"dataType":"string"},
            "endedAt": {"dataType":"string"},
            "limit": {"dataType":"double"},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimesheetEntryDto": {
        "dataType": "refObject",
        "properties": {
            "actionCodeId": {"dataType":"string","required":true},
            "workMode": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["office"]},{"dataType":"enum","enums":["remote"]},{"dataType":"enum","enums":["hybrid"]}],"required":true},
            "country": {"dataType":"string","required":true},
            "startedAt": {"dataType":"datetime"},
            "endedAt": {"dataType":"datetime"},
            "durationMin": {"dataType":"double","required":true},
            "note": {"dataType":"string"},
            "day": {"dataType":"datetime","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_TimesheetEntryDto_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"actionCodeId":{"dataType":"string"},"workMode":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["office"]},{"dataType":"enum","enums":["remote"]},{"dataType":"enum","enums":["hybrid"]}]},"country":{"dataType":"string"},"startedAt":{"dataType":"datetime"},"endedAt":{"dataType":"datetime"},"durationMin":{"dataType":"double"},"note":{"dataType":"string"},"day":{"dataType":"datetime"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimesheetHistorySummary": {
        "dataType": "refObject",
        "properties": {
            "weekStartISO": {"dataType":"string","required":true},
            "status": {"dataType":"string","required":true},
            "weekTotal": {"dataType":"double","required":true},
            "submittedAt": {"dataType":"datetime"},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateActionCodeDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "code": {"dataType":"string","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateActionCodeDto": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "code": {"dataType":"string","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HealthResponse": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"string","required":true},
            "timestamp": {"dataType":"string","required":true},
            "uptime": {"dataType":"double","required":true},
            "openapi": {"dataType":"nestedObjectLiteral","nestedProperties":{"needsRegeneration":{"dataType":"boolean"},"lastGenerated":{"dataType":"string"}}},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GenerateResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "generatedAt": {"dataType":"string"},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LeaveType": {
        "dataType": "refEnum",
        "enums": ["PTO","SICK","UNPAID"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LeaveRequestStatus": {
        "dataType": "refEnum",
        "enums": ["PENDING","APPROVED","REJECTED","CANCELLED"],
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LeaveRequest": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime","required":true},
            "deletedAt": {"dataType":"datetime"},
            "orgId": {"dataType":"string","required":true},
            "organization": {"ref":"Organization","required":true},
            "userId": {"dataType":"string","required":true},
            "user": {"ref":"User","required":true},
            "startDate": {"dataType":"datetime","required":true},
            "endDate": {"dataType":"datetime","required":true},
            "leaveType": {"ref":"LeaveType","required":true},
            "status": {"ref":"LeaveRequestStatus","required":true},
            "reason": {"dataType":"string"},
            "rejectionReason": {"dataType":"string"},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterDto": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginDto": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
        },
        "additionalProperties": true,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"ignore","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsUserController_createUser: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateUserDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/users',
            authenticateMiddleware([{"jwt":["admin","manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.createUser)),

            async function UserController_createUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_createUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'createUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_getUser: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/users/:id',
            authenticateMiddleware([{"jwt":["admin","manager","employee"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUser)),

            async function UserController_getUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'getUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_updateUser: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateUserDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.put('/users/:id',
            authenticateMiddleware([{"jwt":["admin","manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.updateUser)),

            async function UserController_updateUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_updateUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'updateUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_deleteUser: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.delete('/users/:id',
            authenticateMiddleware([{"jwt":["admin","manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.deleteUser)),

            async function UserController_deleteUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_deleteUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'deleteUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_grantWeekendPermit: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/users/:id/weekend-permit',
            authenticateMiddleware([{"jwt":["manager","admin"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.grantWeekendPermit)),

            async function UserController_grantWeekendPermit(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_grantWeekendPermit, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'grantWeekendPermit',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTimesheetHistoryController_listHistory: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"ref":"TimesheetHistoryDto"},
        };
        app.post('/api/v1/timesheet-history/filter',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(TimesheetHistoryController)),
            ...(fetchMiddlewares<RequestHandler>(TimesheetHistoryController.prototype.listHistory)),

            async function TimesheetHistoryController_listHistory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTimesheetHistoryController_listHistory, request, response });

                const controller = new TimesheetHistoryController();

              await templateService.apiHandler({
                methodName: 'listHistory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTimesheetHistoryController_getHistoryForEntity: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                entityType: {"in":"path","name":"entityType","required":true,"ref":"TimesheetHistoryEntityTypeEnum"},
                entityId: {"in":"path","name":"entityId","required":true,"dataType":"string"},
        };
        app.post('/api/v1/timesheet-history/entity/:entityType/:entityId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(TimesheetHistoryController)),
            ...(fetchMiddlewares<RequestHandler>(TimesheetHistoryController.prototype.getHistoryForEntity)),

            async function TimesheetHistoryController_getHistoryForEntity(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTimesheetHistoryController_getHistoryForEntity, request, response });

                const controller = new TimesheetHistoryController();

              await templateService.apiHandler({
                methodName: 'getHistoryForEntity',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTimesheetController_getWeekTimesheet: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                week: {"in":"query","name":"week","required":true,"dataType":"string"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/api/v1/time',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController)),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController.prototype.getWeekTimesheet)),

            async function TimesheetController_getWeekTimesheet(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTimesheetController_getWeekTimesheet, request, response });

                const controller = new TimesheetController();

              await templateService.apiHandler({
                methodName: 'getWeekTimesheet',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTimesheetController_createTimeEntry: Record<string, TsoaRoute.ParameterSchema> = {
                entryDto: {"in":"body","name":"entryDto","required":true,"ref":"TimesheetEntryDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/v1/time',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController)),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController.prototype.createTimeEntry)),

            async function TimesheetController_createTimeEntry(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTimesheetController_createTimeEntry, request, response });

                const controller = new TimesheetController();

              await templateService.apiHandler({
                methodName: 'createTimeEntry',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTimesheetController_updateTimeEntry: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                entryDto: {"in":"body","name":"entryDto","required":true,"ref":"Partial_TimesheetEntryDto_"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.put('/api/v1/time/:id',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController)),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController.prototype.updateTimeEntry)),

            async function TimesheetController_updateTimeEntry(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTimesheetController_updateTimeEntry, request, response });

                const controller = new TimesheetController();

              await templateService.apiHandler({
                methodName: 'updateTimeEntry',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTimesheetController_deleteTimeEntry: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.delete('/api/v1/time/:id',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController)),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController.prototype.deleteTimeEntry)),

            async function TimesheetController_deleteTimeEntry(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTimesheetController_deleteTimeEntry, request, response });

                const controller = new TimesheetController();

              await templateService.apiHandler({
                methodName: 'deleteTimeEntry',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTimesheetController_approveTimeEntry: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/v1/time/:id/approve',
            authenticateMiddleware([{"jwt":["manager","admin"]}]),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController)),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController.prototype.approveTimeEntry)),

            async function TimesheetController_approveTimeEntry(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTimesheetController_approveTimeEntry, request, response });

                const controller = new TimesheetController();

              await templateService.apiHandler({
                methodName: 'approveTimeEntry',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTimesheetController_rejectTimeEntry: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"reason":{"dataType":"string"}}},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/api/v1/time/:id/reject',
            authenticateMiddleware([{"jwt":["manager","admin"]}]),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController)),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController.prototype.rejectTimeEntry)),

            async function TimesheetController_rejectTimeEntry(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTimesheetController_rejectTimeEntry, request, response });

                const controller = new TimesheetController();

              await templateService.apiHandler({
                methodName: 'rejectTimeEntry',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsTimesheetController_getTimesheetHistory: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/v1/time/history',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController)),
            ...(fetchMiddlewares<RequestHandler>(TimesheetController.prototype.getTimesheetHistory)),

            async function TimesheetController_getTimesheetHistory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsTimesheetController_getTimesheetHistory, request, response });

                const controller = new TimesheetController();

              await templateService.apiHandler({
                methodName: 'getTimesheetHistory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsActionCodeController_listActionCodes: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                q: {"in":"query","name":"q","dataType":"string"},
        };
        app.get('/api/v1/action-codes',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ActionCodeController)),
            ...(fetchMiddlewares<RequestHandler>(ActionCodeController.prototype.listActionCodes)),

            async function ActionCodeController_listActionCodes(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsActionCodeController_listActionCodes, request, response });

                const controller = new ActionCodeController();

              await templateService.apiHandler({
                methodName: 'listActionCodes',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsActionCodeController_createActionCode: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"CreateActionCodeDto"},
        };
        app.post('/api/v1/action-codes',
            authenticateMiddleware([{"jwt":["manager","admin"]}]),
            ...(fetchMiddlewares<RequestHandler>(ActionCodeController)),
            ...(fetchMiddlewares<RequestHandler>(ActionCodeController.prototype.createActionCode)),

            async function ActionCodeController_createActionCode(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsActionCodeController_createActionCode, request, response });

                const controller = new ActionCodeController();

              await templateService.apiHandler({
                methodName: 'createActionCode',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsActionCodeController_updateActionCode: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateActionCodeDto"},
        };
        app.put('/api/v1/action-codes/:id',
            authenticateMiddleware([{"jwt":["manager","admin"]}]),
            ...(fetchMiddlewares<RequestHandler>(ActionCodeController)),
            ...(fetchMiddlewares<RequestHandler>(ActionCodeController.prototype.updateActionCode)),

            async function ActionCodeController_updateActionCode(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsActionCodeController_updateActionCode, request, response });

                const controller = new ActionCodeController();

              await templateService.apiHandler({
                methodName: 'updateActionCode',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsActionCodeController_deleteActionCode: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/api/v1/action-codes/:id',
            authenticateMiddleware([{"jwt":["manager","admin"]}]),
            ...(fetchMiddlewares<RequestHandler>(ActionCodeController)),
            ...(fetchMiddlewares<RequestHandler>(ActionCodeController.prototype.deleteActionCode)),

            async function ActionCodeController_deleteActionCode(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsActionCodeController_deleteActionCode, request, response });

                const controller = new ActionCodeController();

              await templateService.apiHandler({
                methodName: 'deleteActionCode',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSystemController_getHealth: Record<string, TsoaRoute.ParameterSchema> = {
                autoGen: {"in":"query","name":"autoGen","dataType":"boolean"},
        };
        app.get('/system/health',
            ...(fetchMiddlewares<RequestHandler>(SystemController)),
            ...(fetchMiddlewares<RequestHandler>(SystemController.prototype.getHealth)),

            async function SystemController_getHealth(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSystemController_getHealth, request, response });

                const controller = new SystemController();

              await templateService.apiHandler({
                methodName: 'getHealth',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSystemController_generateOpenApi: Record<string, TsoaRoute.ParameterSchema> = {
                frontend: {"in":"query","name":"frontend","dataType":"boolean"},
        };
        app.post('/system/generate-openapi',
            ...(fetchMiddlewares<RequestHandler>(SystemController)),
            ...(fetchMiddlewares<RequestHandler>(SystemController.prototype.generateOpenApi)),

            async function SystemController_generateOpenApi(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSystemController_generateOpenApi, request, response });

                const controller = new SystemController();

              await templateService.apiHandler({
                methodName: 'generateOpenApi',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSystemController_getOpenApiStatus: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/system/openapi-status',
            ...(fetchMiddlewares<RequestHandler>(SystemController)),
            ...(fetchMiddlewares<RequestHandler>(SystemController.prototype.getOpenApiStatus)),

            async function SystemController_getOpenApiStatus(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSystemController_getOpenApiStatus, request, response });

                const controller = new SystemController();

              await templateService.apiHandler({
                methodName: 'getOpenApiStatus',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLeaveRequestController_getLeaveRequests: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/leave-requests',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(LeaveRequestController)),
            ...(fetchMiddlewares<RequestHandler>(LeaveRequestController.prototype.getLeaveRequests)),

            async function LeaveRequestController_getLeaveRequests(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLeaveRequestController_getLeaveRequests, request, response });

                const controller = new LeaveRequestController();

              await templateService.apiHandler({
                methodName: 'getLeaveRequests',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLeaveRequestController_getLeaveRequest: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/leave-requests/:id',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(LeaveRequestController)),
            ...(fetchMiddlewares<RequestHandler>(LeaveRequestController.prototype.getLeaveRequest)),

            async function LeaveRequestController_getLeaveRequest(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLeaveRequestController_getLeaveRequest, request, response });

                const controller = new LeaveRequestController();

              await templateService.apiHandler({
                methodName: 'getLeaveRequest',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLeaveRequestController_createLeaveRequest: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"reason":{"dataType":"string"},"leaveType":{"ref":"LeaveType","required":true},"endDate":{"dataType":"datetime","required":true},"startDate":{"dataType":"datetime","required":true}}},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/leave-requests',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(LeaveRequestController)),
            ...(fetchMiddlewares<RequestHandler>(LeaveRequestController.prototype.createLeaveRequest)),

            async function LeaveRequestController_createLeaveRequest(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLeaveRequestController_createLeaveRequest, request, response });

                const controller = new LeaveRequestController();

              await templateService.apiHandler({
                methodName: 'createLeaveRequest',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLeaveRequestController_updateLeaveRequestStatus: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"status":{"ref":"LeaveRequestStatus","required":true}}},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.put('/leave-requests/:id/status',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(LeaveRequestController)),
            ...(fetchMiddlewares<RequestHandler>(LeaveRequestController.prototype.updateLeaveRequestStatus)),

            async function LeaveRequestController_updateLeaveRequestStatus(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLeaveRequestController_updateLeaveRequestStatus, request, response });

                const controller = new LeaveRequestController();

              await templateService.apiHandler({
                methodName: 'updateLeaveRequestStatus',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthenticationController_register: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"RegisterDto"},
        };
        app.post('/auth/register',
            ...(fetchMiddlewares<RequestHandler>(AuthenticationController)),
            ...(fetchMiddlewares<RequestHandler>(AuthenticationController.prototype.register)),

            async function AuthenticationController_register(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthenticationController_register, request, response });

                const controller = new AuthenticationController();

              await templateService.apiHandler({
                methodName: 'register',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthenticationController_login: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"LoginDto"},
        };
        app.post('/auth/login',
            ...(fetchMiddlewares<RequestHandler>(AuthenticationController)),
            ...(fetchMiddlewares<RequestHandler>(AuthenticationController.prototype.login)),

            async function AuthenticationController_login(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthenticationController_login, request, response });

                const controller = new AuthenticationController();

              await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthenticationController_logout: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/auth/logout',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthenticationController)),
            ...(fetchMiddlewares<RequestHandler>(AuthenticationController.prototype.logout)),

            async function AuthenticationController_logout(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthenticationController_logout, request, response });

                const controller = new AuthenticationController();

              await templateService.apiHandler({
                methodName: 'logout',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthenticationController_getCurrentUser: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/auth/current',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthenticationController)),
            ...(fetchMiddlewares<RequestHandler>(AuthenticationController.prototype.getCurrentUser)),

            async function AuthenticationController_getCurrentUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthenticationController_getCurrentUser, request, response });

                const controller = new AuthenticationController();

              await templateService.apiHandler({
                methodName: 'getCurrentUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await Promise.any(secMethodOrPromises);

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }

                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

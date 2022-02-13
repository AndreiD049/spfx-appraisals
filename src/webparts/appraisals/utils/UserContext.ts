import { IContextInfo } from '@pnp/sp/sites';
import { IUserGroupPermissions } from 'property-pane-access-control';
import * as React from 'react';
import { IUserGroup } from '../dal/Groups';
import { IUser } from '../dal/IUser';

export interface IUserContext {
    siteInfo: IContextInfo;
    userInfo: IUser;
    userGroups: IUserGroup[];
    teamUsers: any[];
    permissions: IUserGroupPermissions;
    canUserLock: boolean;
    canUserFinish: boolean;
    canUserCreate: boolean;
}

const UserContext = React.createContext<IUserContext>({
    siteInfo: null,
    userInfo: null,
    userGroups: [],
    teamUsers: [],
    permissions: {},
    canUserLock: false,
    canUserFinish: false,
    canUserCreate: false,
});

export default UserContext;

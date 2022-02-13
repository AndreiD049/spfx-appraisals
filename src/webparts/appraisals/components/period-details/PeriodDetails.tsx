import {
    getTheme,
    PrimaryButton,
    Stack,
    StackItem,
} from '@microsoft/office-ui-fabric-react-bundle';
import { Icon, Separator, Text } from 'office-ui-fabric-react';
import { canCurrentUser } from 'property-pane-access-control';
import * as React from 'react';
import IPeriod from '../../dal/IPeriod';
import { IUser } from '../../dal/IUser';
import { getPeriod, ChangeLockPeriod } from '../../dal/Periods';
import { getCurrentUser } from '../../dal/Users';
import useForceUpdate from '../../utils/forceUpdate';
import UserContext from '../../utils/UserContext';
import Feedback from '../items/Feedback';
import ObjectiveItems from '../items/ObjectiveItems';
import PeoplePicker from '../items/PeoplePicker';
import SwotItems from '../items/SwotItems';
import TrainingItems from '../items/TrainingItems';
import styles from './PeriodDetails.module.scss';

export interface IPeriodDetailsProps {
    ID: string;
}

const theme = getTheme();

/**
 * Page showing the details for the choosen apprisal period
 * There are 3 sections on the appraisal:
 * - Objectives
 * - Trainings
 * - SWOT Matrix
 */
const PeriodDetails = (props: IPeriodDetailsProps) => {
    const context = React.useContext(UserContext);
    const forceUpdate = useForceUpdate();
    const [period, setPeriod] = React.useState<IPeriod>(null);
    const [currentUser, setCurrentUser] = React.useState<IUser>(null);

    /** Check if period is locked for current user */
    const isLocked = React.useMemo(() => {
        if (period && currentUser) {
            if (!period.LockedId || period.LockedId.length === 0) {
                return false;
            }
            const lockedSet = new Set(period.LockedId);
            return lockedSet.has(Number(currentUser.Id));
        }
        /** locked by default */
        return true;
    }, [period, currentUser]);

    const isCurrentLoggedUserSelected = React.useMemo(() => {
        if (!currentUser || !context.userInfo) return false;
        return currentUser.Id === context.userInfo.Id;
    }, [currentUser, context.userInfo]);

    /** Check if period is disabled for current user (whether locked or already finished) */
    const disabled = React.useMemo(() => {
        if (!period || !currentUser || !context.userInfo) {
            return true;
        }
        if (period.Status === 'Finished') {
            return true;
        }
        /** Only disable editing for locked items of the current logged in user */
        return isLocked && isCurrentLoggedUserSelected;
    }, [period, isLocked, currentUser, context, isCurrentLoggedUserSelected]);

    const [showLockButton, setShowLockButton] = React.useState(false);
    React.useEffect(() => {
        async function run() {
            const hasAccess = await canCurrentUser('lock', context.permissions);
            /** If user doesn't have access, do not show */
            if (!hasAccess) return setShowLockButton(false);
            /** If user is viewing his own appraisal, do not show */
            if (isCurrentLoggedUserSelected) return setShowLockButton(false);
            setShowLockButton(true);
        }
        run();
    }, [isCurrentLoggedUserSelected, context]);

    const handleLock = async () => {
        if (period && currentUser) {
            const result = await ChangeLockPeriod(
                period.ID,
                currentUser.Id,
                !isLocked
            );
            setPeriod(result);
        }
    };

    React.useEffect(() => {
        async function run() {
            const result = await getPeriod(props.ID);
            setPeriod(result);
        }
        run();
    }, [forceUpdate]);

    React.useEffect(() => {
        async function run() {
            setCurrentUser(await getCurrentUser());
        }
        run();
    }, []);

    return (
        <Stack horizontalAlign="center" tokens={{ childrenGap: 12 }}>
            <StackItem align="stretch">
                <Text
                    variant="xLarge"
                    block
                    style={{
                        marginTop: theme.spacing.m,
                        textAlign: 'center',
                    }}
                >
                    Appraisal Details
                </Text>
                <Text
                    variant="medium"
                    block
                    style={{
                        textAlign: 'center',
                        color: theme.palette.neutralSecondary,
                    }}
                >
                    {period ? period.Title : 'Loading...'}
                    {isLocked ? (
                        <Icon
                            style={{ marginLeft: theme.spacing.s2 }}
                            iconName="Lock"
                        />
                    ) : null}
                </Text>
            </StackItem>
            <StackItem>
                <PeoplePicker
                    people={context.teamUsers}
                    selected={currentUser}
                    setSelected={setCurrentUser}
                />
            </StackItem>
            <Stack
                verticalAlign="center"
                horizontalAlign="center"
                style={{ marginTop: theme.spacing.l1 }}
            >
                <Separator className={styles.itemDetailsSeparator}>
                    <Text variant="mediumPlus">Objectives</Text>
                </Separator>
                <ObjectiveItems
                    user={currentUser}
                    period={period}
                    disabled={disabled}
                />
            </Stack>
            {/* My goals */}
            <Stack
                verticalAlign="center"
                horizontalAlign="center"
                style={{ marginTop: theme.spacing.l1 }}
            >
                <Separator className={styles.itemDetailsSeparator}>
                    <Text variant="mediumPlus">Trainings</Text>
                </Separator>
                <TrainingItems
                    user={currentUser}
                    period={period}
                    disabled={disabled}
                />
            </Stack>
            {/* Trainings requested by me of my TL */}
            <StackItem>
                <Separator className={styles.itemDetailsSeparator}>
                    <Text variant="mediumPlus">SWOT</Text>
                </Separator>
                <SwotItems
                    user={currentUser}
                    period={period}
                    disabled={disabled}
                />
            </StackItem>
            {/* My self-evaluation */}
            <StackItem>
                <Separator className={styles.itemDetailsSeparator}>
                    <Text variant="mediumPlus">Feedback</Text>
                </Separator>
                <Feedback
                    user={currentUser}
                    period={period}
                    disabled={disabled}
                />
            </StackItem>
            {showLockButton ? (
                <StackItem>
                    <PrimaryButton
                        iconProps={{ iconName: 'Lock' }}
                        text={isLocked ? 'Unlock' : 'Lock'}
                        onClick={handleLock}
                    />
                </StackItem>
            ) : null}
            <div style={{ marginBottom: '4em' }} />
        </Stack>
    );
};

export default PeriodDetails;

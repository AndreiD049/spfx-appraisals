import { Stack } from '@microsoft/office-ui-fabric-react-bundle';
import { TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import IItem from '../../dal/IItem';
import IPeriod from '../../dal/IPeriod';
import { getItems } from '../../dal/Items';
import { IUser } from '../../dal/IUser';
import styles from './AppraisalItems.module.scss';
import { emptyItem, handleItemUpdate, setItemAction } from './utils';

export interface IFeedbackProps {
    user: IUser;
    period: IPeriod;
    disabled: boolean;
}

const Feedback: React.FC<IFeedbackProps> = (props) => {
    const [originalItem, setOriginalItem] = React.useState<IItem>(null);
    const [item, setItem] = React.useState<IItem>(null);

    React.useEffect(() => {
        async function run() {
            if (props.period && props.user) {
                const itemResult = (
                    await getItems('Feedback', props.period.ID, props.user.Id)
                )[0];
                setOriginalItem(itemResult ?? emptyItem('Feedback'));
                setItem(itemResult ?? emptyItem('Feedback'));
            }
        }
        run();
    }, [props]);

    const setItemHandler = (actionObject: setItemAction) => {
        switch (actionObject.action) {
            case 'create':
            case 'update':
                setItem(actionObject.item);
                setOriginalItem(actionObject.item);
                break;
            case 'delete':
                setItem(emptyItem('Feedback'));
                setOriginalItem(emptyItem('Feedback'));
                break;
            default:
                throw new Error(
                    `Invalid action received ${actionObject.action}`
                );
        }
    };

    const handleValueUpdate = React.useCallback(async () => {
        await handleItemUpdate(
            originalItem,
            item.Content,
            'NA',
            'Feedback',
            props.period.ID,
            props.user.Id,
            setItemHandler
        );
    }, [props, item, originalItem]);

    const handleBlur = React.useCallback(() => {
        if (item.Content !== originalItem.Content) {
            handleValueUpdate();
        }
    }, [props, item, originalItem]);

    if (!props.period || !props.user) return null;

    return (
        <Stack horizontal horizontalAlign="center">
            <div className={styles.feedbackContainer}>
                <TextField
                    multiline
                    resizable={false}
                    autoAdjustHeight
                    readOnly={props.disabled}
                    onBlur={!props.disabled && handleBlur}
                    onChange={(_e: any, newVal: string) =>
                        setItem((prev) => ({
                            ...prev,
                            Content: newVal,
                        }))
                    }
                    value={item?.Content}
                />
            </div>
        </Stack>
    );
};

export default Feedback;

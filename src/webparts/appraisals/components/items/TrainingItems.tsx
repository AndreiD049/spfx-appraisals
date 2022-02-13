import { Stack } from 'office-ui-fabric-react';
import * as React from 'react';
import { FC } from 'react';
import IItem from '../../dal/IItem';
import IPeriod from '../../dal/IPeriod';
import { getItems } from '../../dal/Items';
import { IUser } from '../../dal/IUser';
import ItemContainer from './ItemContainer';
import styles from './AppraisalItems.module.scss';

export interface ITrainingItemsProps {
    user: IUser;
    period: IPeriod;
}

const TrainingItems: FC<ITrainingItemsProps> = (props) => {
    const [items, setItems] = React.useState<IItem[]>([]);

    const achieved = React.useMemo(() => {
        return items.filter(
            (item) =>
                item.ItemStatus === 'Achieved' &&
                +item.AchievedIn?.Id === +props.period.ID
        );
    }, [items]);

    const planned = React.useMemo(() => {
        return items.filter(
            (item) =>
                item.ItemStatus === 'Planned' ||
                +item.AchievedIn?.Id > +props.period.ID
        );
    }, [items]);

    React.useEffect(() => {
        async function run() {
            if (props.user && props.period) {
                const result = await getItems(
                    'Training',
                    props.period.ID,
                    props.user?.Id
                );
                setItems(result);
            }
        }
        run();
    }, [props.user, props.period]);

    if (!props.period) return null;

    return (
        <span
            className={styles.container}
            style={{
                padding: '0 1em',
                display: 'flex',
                flexFlow: 'row wrap',
            }}
        >
            {/* Achieved */}
            <ItemContainer
                className={`${styles.buttonLeft} ${styles.itemsGroup} ${styles.simple}`}
                items={achieved}
                minItems={3}
                status="Achieved"
                itemType="Training"
                period={props.period}
                userId={props.user?.Id}
                setItems={setItems}
            />
            {/* Planned */}
            <ItemContainer
                className={`${styles.itemsGroup} ${styles.simple}`}
                items={planned}
                minItems={3}
                status="Planned"
                itemType="Training"
                period={props.period}
                userId={props.user?.Id}
                setItems={setItems}
            />
        </span>
    );
};

export default TrainingItems;

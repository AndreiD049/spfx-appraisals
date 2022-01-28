import { FC } from 'react';
import * as React from 'react';
import {
    Stack,
    Text,
    StackItem,
    CommandBar,
    SearchBox,
    IColumn,
    DetailsList,
    DetailsListLayoutMode,
    Selection,
    getTheme,
} from 'office-ui-fabric-react';
import IPeriod from '../../dal/IPeriod';
import { getPeriods } from '../../dal/Periods';
import constants from '../../utils/constants';
import NewPeriodPanel from './NewPeriodPanel';
import { useHistory } from 'react-router-dom';

const theme = getTheme();
const pillStyles: (item: IPeriod) => React.CSSProperties = (item) => ({
    boxSizing: 'border-box',
    padding: '4px 8px 5px 8px',
    borderRadius: '16px',
    height: '24px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: 75,
    textAlign: 'center',
    backgroundColor:
        item.Status == 'Open'
            ? theme.palette.greenLight
            : theme.palette.blueLight,
    color: theme.palette.white,
});

/* Element showing all appraisal periods */
const AppraisalPeriods: FC = () => {
    const history = useHistory();
    const [searchValue, setSearchValue] = React.useState<string>('');
    const [periods, setPeriods] = React.useState<IPeriod[]>([]);
    /* Items to be shown on the table  */
    const filteredPeriods = React.useMemo(() => {
        console.log(!searchValue);
        if (!searchValue) {
            return periods;
        } else {
            return periods.filter(
                (p) => p.Title.toLowerCase().indexOf(searchValue) > -1
            );
        }
    }, [searchValue, periods]);

    /* Selection */
    const [selectedItem, setSelectedItem] = React.useState<IPeriod>(null);
    const selection = React.useMemo(
        () =>
            new Selection({
                getKey: (item: IPeriod) => item.ID,
                items: periods,
                onSelectionChanged: () =>
                    setSelectedItem(
                        selection.getSelection()
                            ? selection.getSelection()[0]
                            : null
                    ),
            }),
        [periods]
    );

    /* New period panel state */
    const [newPanel, setNewPanel] = React.useState<boolean>(false);

    /* Columns */
    const columns: IColumn[] = [
        {
            key: 'status',
            name: 'Status',
            iconName: 'StatusCircleRing',
            minWidth: 100,
            maxWidth: 100,
            isResizable: true,
            onRender: (item: IPeriod) => (
                <div style={pillStyles(item)}>{item.Status}</div>
            ),
        },
        {
            key: 'title',
            name: 'Title',
            iconName: 'Rename',
            fieldName: 'Title',
            minWidth: 300,
        },
        {
            key: 'createdon',
            name: 'Created on',
            iconName: 'Calendar',
            onRender: (item: IPeriod) =>
                new Date(item.Created).toLocaleString(),
            minWidth: 250,
            maxWidth: 250,
        },
        {
            key: 'createdby',
            name: 'Created by',
            iconName: 'People',
            onRender: (item: IPeriod) => item.Author.Title,
            minWidth: 300,
            maxWidth: 300,
        },
    ];

    /* Load initial data */
    React.useEffect(() => {
        async function run() {
            const result = await getPeriods();
            setPeriods(result);
        }

        run();
    }, []);

    const handleOpenItem = (item: IPeriod) => {
        const url = new URL(window.location.href);
        url.searchParams.set(constants.periodId, item.ID.toString());
        history.push(url.pathname + url.search);
    };

    return (
        <>
            <Stack verticalAlign="center">
                <StackItem align="center">
                    <header>
                        <Text variant="xxLarge">Appraisals</Text>
                    </header>
                </StackItem>
                <main>
                    {/* Add new periods, finish periods, open */}
                    <CommandBar
                        items={[
                            {
                                key: 'new',
                                text: 'New',
                                onClick: () => setNewPanel(true),
                                iconProps: {
                                    iconName: 'Add',
                                },
                            },
                            {
                                key: 'open',
                                text: 'Open',
                                onClick: () => handleOpenItem(selectedItem),
                                disabled: !Boolean(selectedItem),
                                iconProps: {
                                    iconName: 'OEM',
                                },
                            },
                            {
                                key: 'finish',
                                text: 'Finish',
                                onClick: () => alert('finishing'),
                                disabled: !Boolean(selectedItem),
                                iconProps: {
                                    iconName: 'LockSolid',
                                },
                            },
                        ]}
                        farItems={[
                            {
                                key: 'search',
                                onRender: () => (
                                    <SearchBox
                                        onChange={(_e: any, newValue: string) =>
                                            setSearchValue(
                                                newValue.toLowerCase()
                                            )
                                        }
                                        placeholder="Search"
                                        styles={{ root: { width: 300 } }}
                                    />
                                ),
                            },
                        ]}
                    />
                    {/* Table with all appraisal items */}
                    <DetailsList
                        onItemInvoked={handleOpenItem}
                        selection={selection}
                        columns={columns}
                        items={filteredPeriods}
                        layoutMode={DetailsListLayoutMode.justified}
                    />
                </main>
            </Stack>
            <NewPeriodPanel isOpen={newPanel} setOpen={setNewPanel} />
        </>
    );
};

export default AppraisalPeriods;

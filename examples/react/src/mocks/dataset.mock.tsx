import faker from "@faker-js/faker";
import { Cell, CellRendererProps, TableModel, composeDataset } from "@h6s/table";
import { format } from "date-fns";

const TOTAL_BY_DATE = "#TOTAL_BY_DATE";
const TOTAL_BY_DATE_AND_ID = "#TOTAL_BY_DATE_AND_ID";

export interface DatasetType {
  date: string;
  id: string;
  subId: string;
  amount: number;
  cancelAmount: number;
  buyer: string;
  plcc: number;
  debit: number;
  transfer: number;
  meta: {
    transactionId: string;
  };
  message: string;
}

const DATASET: DatasetType[] = generateMockDataset();

export const DATASET_WITH_SUMMARY = composeDataset(DATASET, {
  groupBy: "date",
  compose: (rows) => {
    const appended = composeDataset(rows, {
      groupBy: "id",
      compose: (rows) => {
        return rows.concat({
          subId: TOTAL_BY_DATE_AND_ID,
          amount: sum(rows.map((x) => x.amount)),
          cancelAmount: sum(rows.map((x) => x.cancelAmount)),
          buyer: "",
          plcc: sum(rows.map((x) => x.plcc)),
          debit: sum(rows.map((x) => x.debit)),
          transfer: sum(rows.map((x) => x.transfer)),
          meta: {
            transactionId: "",
          },
          message: "",
        });
      },
    });

    return appended.concat({
      id: TOTAL_BY_DATE,
      subId: "",
      amount: sum(rows.map((x) => x.amount)),
      cancelAmount: sum(rows.map((x) => x.cancelAmount)),
      buyer: "",
      plcc: sum(rows.map((x) => x.plcc)),
      debit: sum(rows.map((x) => x.debit)),
      transfer: sum(rows.map((x) => x.transfer)),
      meta: {
        transactionId: "",
      },
      message: "",
    });
  },
});

function generateMockDataset() {
  return [...new Array(30).keys()]
    .map(() => {
      return {
        date: format(faker.date.between("2022-01-01", "2022-01-04"), "yyyy-MM-dd"),
        id: faker.datatype.number({ min: 103, max: 106 }).toString(),
        subId: faker.datatype.number({ min: 9870, max: 9900 }).toString(),

        amount: Number(faker.commerce.price()),
        cancelAmount: Number(faker.commerce.price()),

        buyer: faker.name.findName(),

        plcc: Number(faker.commerce.price()),
        debit: Number(faker.commerce.price()),
        transfer: Number(faker.commerce.price()),

        meta: {
          transactionId: faker.lorem.slug(2),
        },
        message: faker.commerce.productName(),
      };
    })
    .sort((a, b) => Number(b.subId) - Number(a.subId))
    .sort((a, b) => Number(b.id) - Number(a.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const TABLE_MODEL: TableModel<DatasetType> = [
  {
    accessor: "date",
    label: "Date",
    cell: {
      mergeRow: "date",
    },
    foot: [() => <>{"Total"}</>],
  },
  {
    accessor: "id",
    label: "Id",
    cell: {
      mergeRow: ["date", "id"],
      colSpanAs: (x) => (x.id === TOTAL_BY_DATE ? 2 : 1),
      render: [
        ({ cellProps, children }) => {
          if (cellProps.value === TOTAL_BY_DATE) {
            return <span>{format(new Date(cellProps.rowValues.date), "M/d")} TOTAL</span>;
          }

          return <>{children}</>;
        },
      ],
    },
  },
  {
    accessor: "subId",
    label: "Sub Id",
    cell: {
      mergeRow: ({ date, id, subId }) => date + id + subId,
      colSpanAs: (x) => (x.id === TOTAL_BY_DATE ? 0 : 1),
      render: [
        ({ cellProps, children }) => {
          if (cellProps.value === TOTAL_BY_DATE_AND_ID) {
            return <span>{cellProps.rowValues.id} TOTAL</span>;
          }

          return <>{children}</>;
        },
      ],
    },
  },
  {
    accessor: [
      {
        accessor: "amount",
        label: "Paid",
        cell: [CurrencyCellValue],
        foot: [() => <>{sum(DATASET.map((x) => x.amount)).toLocaleString()}</>],
      },
      {
        accessor: "cancelAmount",
        label: "Canceled",
        cell: [CurrencyCellValue],
        foot: {
          render: [() => <>{sum(DATASET.map((x) => x.cancelAmount)).toLocaleString()}</>],
          extends: false,
        },
      },
    ],
    label: "AMOUNT",
  },
  {
    accessor: "buyer",
    label: "Buyer",
  },
  {
    accessor: [
      {
        accessor: [
          {
            accessor: "plcc",
            label: "Plcc",
            cell: [CurrencyCellValue],
            foot: {
              render: [() => <>{sum(DATASET.map((x) => x.plcc)).toLocaleString()}</>],
            },
          },
          {
            accessor: "debit",
            label: "Debit",
            cell: [CurrencyCellValue],
            foot: {
              render: [() => <>{sum(DATASET.map((x) => x.debit)).toLocaleString()}</>],
            },
          },
        ],
        label: "CARD",
      },
      {
        accessor: "transfer",
        label: "Transfer",
        cell: [CurrencyCellValue],
        foot: {
          render: [() => <>{sum(DATASET.map((x) => x.transfer)).toLocaleString()}</>],
        },
      },
    ],
    label: "PAY METHOD",
  },
  {
    accessor: "meta.transactionId",
    label: "Transaction Id",
  },
  {
    accessor: "message",
    label: "Message",
  },
];

function sum(...arr: number[] | number[][]) {
  return arr.flat().reduce((a, b) => a + b, 0);
}

function CurrencyCellValue({ cellProps }: CellRendererProps<Cell<DatasetType>>) {
  return <>{cellProps.value?.toLocaleString()}</>;
}

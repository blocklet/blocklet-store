import Datatable from '@arcblock/ux/lib/Datatable';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useMount, useReactive } from 'ahooks';
import PropTypes from 'prop-types';
import { memo, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import usePageState from '../../hooks/page-state';
import useTableState from '../../hooks/table';
import { awaitWrap } from '../../libs/util';
import TabContainer from './tab-container';

const PAGE_SIZE = 10;

function Table({
  ref = null,
  data = [],
  columns = [],
  options = {},
  hideColumns = [],
  containerStyle = {},
  getData = () => {},
  page = 1,
  pageSize = PAGE_SIZE,
  persistence = true,
  ...rest
}) {
  // const { locale, t } = useContext(LocaleContext);
  const { locale } = useContext(LocaleContext);
  const delayTimer = useRef(null);
  // 持久化存储 pageSize、innerHideColumns、sortDirection、sortBy
  const PageState = usePageState({ pageSize }, persistence);
  // 非持久化存储
  const innerPageState = useReactive({
    total: 0,
    page,
    data: null,
    error: null,
    pageSize,
    loading: false,
    keyword: '',
    filter: {},
    innerHideColumns: null,
    sortDirection: '',
    sortBy: '',
  });
  const tableState = useTableState(PageState, innerPageState, persistence);
  useEffect(() => {
    if (!options.serverSide) {
      tableState.data = data;
      tableState.total = data?.length || 0;
    }
  }, [options.serverSide, data, tableState]);

  function getFilter(filterList, column) {
    const filterObj = {};
    filterList.forEach((item, index) => {
      if (item.length > 0) {
        filterObj[column[index].name] = item;
      }
    });
    return filterObj;
  }

  async function changeData(currentPage, size = tableState.pageSize) {
    if (options.serverSide) {
      tableState.loading = true;

      const [error, result = {}] = await awaitWrap(
        getData({
          page: currentPage,
          pageSize: size,
          keyword: tableState.keyword,
          filter: tableState.filter,
          sortBy: tableState.sortBy,
          sortDirection: tableState.sortDirection,
        })
      );
      tableState.loading = false;
      if (error) {
        tableState.error = error;
      } else {
        const { data: resData = [], total = 0 } = result;
        tableState.data = resData;
        tableState.page = currentPage;
        tableState.total = total;
        tableState.pageSize = size;
      }
    } else {
      tableState.page = currentPage;
      tableState.pageSize = size;
    }
  }

  const onChange = async (e, action) => {
    if (options.serverSide) {
      const { page: currentPage, rowsPerPage, searchText, filterList, sortOrder } = e;
      switch (action) {
        case 'search':
          clearTimeout(delayTimer.current);
          delayTimer.current = setTimeout(() => {
            tableState.keyword = searchText || '';
            changeData(1);
          }, 300);
          break;
        case 'changeRowsPerPage':
          await changeData(1, rowsPerPage);
          break;
        case 'changePage':
          await changeData(currentPage + 1, rowsPerPage);
          break;
        case 'filterChange':
          tableState.filter = getFilter(filterList, columns);
          changeData(1);
          break;
        case 'sort':
          tableState.sortBy = sortOrder.name;
          tableState.sortDirection = sortOrder.direction;
          changeData(1);
          break;
        default:
          break;
      }
    }
  };

  function onViewColumnsChange(changedColumn, action) {
    //  定制化的需求: 把表格一些列藏(hideColumns)起来，让用户去开启，如果已经存在隐藏(innerHideColumns)列则默认是用户行为，使用 innerHideColumns
    const innerHideColumns = tableState.innerHideColumns || hideColumns;
    const mapFn = {
      remove() {
        innerHideColumns.push(changedColumn);
      },
      add() {
        innerHideColumns.splice(innerHideColumns.indexOf(changedColumn), 1);
      },
    };
    mapFn[action]();
    tableState.innerHideColumns = innerHideColumns;
  }

  const processedColumns = columns.map((column) => {
    if (column.options?.customCellRender && column.options.customCellRender instanceof Function) {
      const { customCellRender } = column.options;
      column.options.customBodyRenderLite = (dataIndex, rowIndex) => {
        const itemData = tableState.data[dataIndex];
        return itemData ? customCellRender(itemData, dataIndex, rowIndex, tableState.data) : undefined;
      };
      delete column.options.customCellRender;
    }
    if ((tableState.innerHideColumns || hideColumns).includes(column.name)) {
      return {
        ...column,
        options: {
          ...(column.options || {}),
          display: false,
        },
      };
    }
    return column;
  });

  useMount(async () => {
    if (options.serverSide) {
      await changeData(tableState.page);
    }
  });
  useImperativeHandle(ref, () => ({
    // 默认初始化current page 为1,但当 修改和删除 应该需要保持当前页码
    async refresh(force = false) {
      const currentPage = force ? 1 : tableState.page;
      await changeData(currentPage);
    },
  }));

  if (options.serverSide) {
    if (tableState.error) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {tableState.error?.response?.data?.error}
        </Box>
      );
    }
  }
  if (!tableState.data) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TabContainer style={{ ...containerStyle }}>
      <Datatable
        loading={tableState.loading}
        locale={locale}
        {...rest}
        onChange={onChange}
        columns={processedColumns}
        data={tableState.data}
        options={{
          print: false,
          enableNestedDataAccess: '.',
          selectableRowsHideCheckboxes: true,
          page: tableState.page - 1, // mui-datatable 的页面分页从0开始
          rowsPerPage: tableState.pageSize,
          count: tableState.total,
          rowsPerPageOptions: [10, 20, 50],
          download: false,
          ...options,
          sortOrder:
            tableState.sortBy && tableState.sortDirection
              ? { name: tableState.sortBy, direction: tableState.sortDirection }
              : options.sortOrder,
          onViewColumnsChange,
        }}
      />
    </TabContainer>
  );
}

Table.propTypes = {
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  containerStyle: PropTypes.object,
  options: PropTypes.object,
  data: PropTypes.array,
  columns: PropTypes.array,
  hideColumns: PropTypes.array,
  getData: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  // 是否需要将 Table 中的部分数据持久化存储
  persistence: PropTypes.bool,
};

export default memo(Table);

<script>
  import { createEventDispatcher } from 'svelte';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import Select, {Option} from '@smui/select';

  const dispatch = createEventDispatcher();

  export let columns;
  export let rows;
  export let sortBy = "";
  export let sortOrder = 1;
  export let iconAsc = '▲';
  export let iconDesc = '▼';
  export let classNameTable = '';
  export let classNameThead = '';
  export let classNameTbody = '';
  export let classNameSelect = '';
  export let classNameRow = '';
  export let classNameCell = '';

  let sortFunction = () => "";
  let showFilterHeader = columns.some(c => c.filterOptions !== undefined);
  let filterValues = {};
  let filterSettings = {};
  let columnByKey = {};

  columns.forEach(col => {
    columnByKey[col.key] = col;
  });

  $: c_rows = rows
    .filter(r =>
      Object.keys(filterSettings).every(f => {
        let ret = (
          filterSettings[f] === undefined ||
          // default to value() if filterValue() not provided in col
          filterSettings[f] === (typeof columnByKey[f].filterValue === 'function' ? 
            columnByKey[f].filterValue(r) : columnByKey[f].value(r))
        );
        return ret;
      })
    )
    .map(r => (Object.assign({}, r, {$sortOn: sortFunction(r)} ) ) )
    .sort((a, b) => {
      if (a.$sortOn > b.$sortOn) return sortOrder;
      else if (a.$sortOn < b.$sortOn) return -sortOrder;
      return 0;
    });

  const asStringArray = (v) => [].concat(v).filter(v => typeof v === 'string' && v !== "").join(' ');

  const calculateFilterValues = () => {
    filterValues = {};
    columns.forEach(c => {
      if (typeof c.filterOptions === "function") {
        filterValues[c.key] = c.filterOptions(rows);
      } else if (Array.isArray(c.filterOptions)) {
        // if array of strings is provided, use it for name and value
        filterValues[c.key] = c.filterOptions.map(val => ({name:val, value:val}));
      }
    });
  };


  $: {
    let col = columnByKey[sortBy];
    if (col !== undefined && col.sortable === true && typeof col.value === "function") {
      sortFunction = r => col.value(r);
    }
  };

  const updateSortOrder = (colKey) => {
    if (colKey === sortBy) {
      sortOrder = sortOrder === 1 ? -1 : 1
    } else {
      sortOrder = 1;
    }
  }
  
  const handleClickCol = (event, col) => {
    updateSortOrder(col.key)
    sortBy = col.key;
    dispatch('clickCol', {event, col, key:col.key} );
  }
  
  const handleClickRow = (event, row) => {
    dispatch('clickRow', {event, row} );
  }

  const handleClickCell = (event, row, key) => {
    dispatch('clickCell', {event, row, key} );
  }

  if (showFilterHeader) {
    calculateFilterValues();
  }
</script>

<style>
  .isSortable {
    cursor: pointer;
  }
</style>

<DataTable class={asStringArray(classNameTable)}>
  <Head class={asStringArray(classNameThead)}>
    {#if showFilterHeader}
      <Row>
        {#each columns as col}
          <Cell>
            {#if filterValues[col.key] !== undefined}
              <Select bind:value={filterSettings[col.key]} class={asStringArray(classNameSelect)}>
                <Option value={undefined}></Option>
                {#each filterValues[col.key] as option}
                  <Option value={option.value}>{option.name}</Option>
                {/each}
              </Select>
            {/if}
          </Cell>
        {/each}
      </Row>
    {/if}
      <slot name="header" sortOrder={sortOrder} sortBy={sortBy}>
        <Row>
          {#each columns as col}
            <Head
              on:click={(e) => handleClickCol(e, col)}
              class={asStringArray([col.sortable ? 'isSortable' : null, col.headerClass])}
            >
              {col.title}
              {#if sortBy === col.key}
                { sortOrder === 1 ? iconAsc : iconDesc}
              {/if}
            </Head>
          {/each}
        </Row>
      </slot>
  </Head>
  <Body class={asStringArray(classNameTbody)}>
    {#each c_rows as row, n}
      <slot name="row" row={row} n={n} >
        <Row on:click={(e)=>{handleClickRow(e, row)}} class={asStringArray(classNameRow)}>
          {#each columns as col}
            <Cell
              on:click={(e)=>{handleClickCell(e, row, col.key)}}
              class={asStringArray([col.class, classNameCell])}
            >{@html col.renderValue ? col.renderValue(row) : col.value(row)}</Cell>
          {/each}
        </Row>
      </slot>
    {/each}
  </Body>
</DataTable>

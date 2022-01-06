import React from 'react'
import Head from 'next/head'
import Router from 'next/router'
import fetch from 'isomorphic-unfetch'

import Toolbar from '@mui/material/Toolbar'
import AppBar from '@mui/material/AppBar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { DataGrid, ukUA, GridToolbar } from '@mui/x-data-grid'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import darkScrollbar from '@mui/material/darkScrollbar'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import type { GridValueFormatterParams, GridCellValue } from '@mui/x-data-grid'

type Result = {
  status: string
  result: {
    pair: string
    data: {
      from: string
      to: string
      results: {
        Опції: { [x: string]: number }
        Прибуток: number
        'Активна позиція': number
        Позиції: number
        '% прибуткових позицій': string
        '% збиткових позицій': string
        'Максимальне падіння': string
        'Середній прибуток': number
        "Середній збиток	Очікуванн'я": number
        'Профіт/Падіння': number
        'Профіт/Лосс': number
      }[]
      leverage?: number
      wallet?: number
    }[]
  }[]
}
type Props = {
  pair: string
}
type Cols = {
  field: string
  sortbale?: boolean
  headerName: string
  width: number
  valueGetter?: (params: any) => string
  renderCell?: (params: any) => React.ReactFragment
  sortComparator?: (v1: any, v2: any) => number
  type?: string
  filterable?: boolean
  hide?: boolean
  valueFormatter?: (params: GridValueFormatterParams) => GridCellValue
}

type State = {
  open: boolean
  data?: Result
  pagesize: number
  theme: boolean
  current: number
}

class Home extends React.Component<Props, State> {
  static getInitialProps(ctx: any) {
    return { pair: ctx.query.pair }
  }
  state: State = {
    open: false,
    data: undefined,
    pagesize: 5,
    theme: false,
    current: 0,
  }

  constructor(props: Props) {
    super(props)
    this.toggle = this.toggle.bind(this)
    this.loadPair = this.loadPair.bind(this)
    this.goToPair = this.goToPair.bind(this)
    this.setPageSize = this.setPageSize.bind(this)
    this.changeTheme = this.changeTheme.bind(this)
  }
  componentDidMount() {
    this.loadPair()
    if (typeof window !== 'undefined') {
      const dark = window.matchMedia('(prefers-color-scheme: dark)')
      dark.addEventListener('change', ({ matches }) => {
        if (matches !== this.state.theme) {
          return this.setState((prev) => ({ ...prev, theme: matches }))
        }
      })
      const get = window.localStorage.getItem('theme')
      if (get) {
        const theme = get === 'dark'
        return this.setState((prev) => ({ ...prev, theme }))
      }
      if (dark.matches !== this.state.theme) {
        return this.setState((prev) => ({ ...prev, theme: dark.matches }))
      }
    }
  }
  toggle() {
    this.setState((prev) => ({ ...prev, open: !prev.open }))
  }
  async loadPair(p?: string) {
    const pair = p || this.props.pair || 'ADAUSDT'
    const res = await fetch(`https://mt.raptom.com.ua/api/data/${pair}`, {
      method: 'get',
    }).then((res) => res.json())
    this.setState((prev) => ({
      ...prev,
      open: false,
      data: res as Result,
      current: 0,
    }))
  }
  goToPair(pair: string) {
    if (pair !== this.state.data?.result[0].pair) {
      Router.push(`https://mt.raptom.com.ua/${pair}`)
      this.loadPair(pair)
    } else {
      this.setState((prev) => ({ ...prev, open: false }))
    }
  }
  setPageSize(pagesize: number) {
    this.setState((prev) => ({ ...prev, pagesize }))
  }
  getTheme() {
    return createTheme(
      {
        palette: {
          mode: this.state.theme ? 'dark' : 'light',
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: this.state.theme ? darkScrollbar() : null,
            },
          },
        },
      },
      ukUA
    )
  }
  changeTheme() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', !this.state.theme ? 'dark' : 'light')
    }
    this.setState((prev) => ({ ...prev, theme: !prev.theme }))
  }
  changeCurrent(current: number) {
    this.setState((prev) => ({ ...prev, current }))
  }
  render() {
    const pairs = [
      'ADAUSDT',
      'BNBUSDT',
      'BNBBUSD',
      'BTCUSDT',
      'BTCBUSD',
      'DOGEUSDT',
      'DOGEBUSD',
      'DOTUSDT',
      'ETHBUSD',
      'ETHUSDT',
      'SOLUSDT',
      'XRPUSDT',
      '1000SHIBUSDT',
    ]
    const Items = () => (
      <List>
        {pairs.map((pair) => (
          <ListItemButton
            key={pair}
            onClick={() => this.goToPair(pair)}
            selected={pair === this.state.data?.result[0].pair}
          >
            <ListItemText>{pair}</ListItemText>
          </ListItemButton>
        ))}
      </List>
    )
    const props = this.state.data
    const c = this.state.current
    if (props && props.result.length > 0) {
      const cols: Cols[] = Object.keys(props.result[0].data[c].results[0]).map(
        (key, ind) => ({
          field: key,
          sortable: key !== 'Опції',
          headerName: key,
          width: ind === 0 ? 250 : 200,
          renderCell:
            key === 'Опції'
              ? (params: any) => (
                  <div>
                    {params.value
                      .split('  ')
                      .map((item: string, ind: number) => (
                        <Typography key={`${item}-${ind}`}>{item}</Typography>
                      ))}
                  </div>
                )
              : undefined,
          sortComparator:
            key !== 'Опції'
              ? (v1, v2) => {
                  return parseFloat(v1) - parseFloat(v2)
                }
              : undefined,
          type: key !== 'Опції' ? 'number' : 'string',
          hide: [
            'Активна позиція',
            '% збиткових позицій',
            'Середній прибуток',
            'Середній збиток',
            'Очікування',
          ].includes(key),
          valueFormatter: [
            'Максимальне падіння',
            '% збиткових позицій',
            '% прибуткових позицій',
          ].includes(key)
            ? (params) => (params.value ? `${params.value}%` : undefined)
            : undefined,
        })
      )
      cols.splice(0, 0, {
        field: 'id',
        headerName: '#',
        width: 70,
        filterable: false,
      })
      const res = props.result[0].data[c].results.sort(
        (a, b) =>
          a.Прибуток +
          a['Активна позиція'] -
          (b.Прибуток + b['Активна позиція'])
      )
      const rows = res.reverse().map((res, ind) => ({
        ...res,
        'Максимальне падіння':
          res['Максимальне падіння'] === 'н/д'
            ? null
            : parseFloat(res['Максимальне падіння']),
        Опції: Object.keys(res['Опції'])
          .map((k) => `${k}: ${res['Опції'][k]}`)
          .join('  '),
        id: ind + 1,
      }))
      const { open } = this.state
      return (
        <ThemeProvider theme={this.getTheme()}>
          <CssBaseline />
          <Head>
            <title>Симуляції</title>
          </Head>
          <AppBar
            position='sticky'
            style={{ zIndex: 100000 }}
            color={this.state.theme ? 'secondary' : 'primary'}
          >
            <Toolbar>
              <IconButton
                edge='start'
                color='inherit'
                aria-label='menu'
                onClick={this.toggle}
              >
                <MenuIcon />
              </IconButton>
              <div style={{ flexGrow: 1 }} />
              <IconButton edge='end' color='inherit' onClick={this.changeTheme}>
                {this.state.theme ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer variant='temporary' open={open} onClose={this.toggle}>
            <Toolbar />
            <Items />
          </Drawer>

          <div style={{ height: '80vh', width: '95%', margin: 'auto' }}>
            <Tabs
              value={this.state.current}
              indicatorColor='primary'
              onChange={(_e, current) => this.changeCurrent(current)}
              style={{ marginBottom: 12, marginTop: 12 }}
              variant='scrollable'
            >
              {props.result[0].data.map((res, i) => (
                <Tab
                  label={`${props.result[0].pair} з ${res.from} по ${res.to}${
                    res.leverage ? ` (плече: ${res.leverage})` : ''
                  }${res.wallet ? ` (гаманець: ${res.wallet})` : ''}`}
                  key={`${res.from}-${i}`}
                />
              ))}
            </Tabs>
            <div style={{ display: 'flex', height: '100%' }}>
              <div style={{ flexGrow: 1 }}>
                <DataGrid
                  rows={rows}
                  columns={cols}
                  pageSize={this.state.pagesize}
                  rowHeight={250}
                  components={{
                    Toolbar: GridToolbar,
                  }}
                  disableVirtualization={this.state.pagesize < 11}
                  columnBuffer={20}
                  disableSelectionOnClick
                  disableDensitySelector
                  showCellRightBorder
                  showColumnRightBorder
                  rowsPerPageOptions={[5, 10, 20, 50]}
                  onPageSizeChange={(pagesize) => this.setPageSize(pagesize)}
                />
              </div>
            </div>
          </div>
        </ThemeProvider>
      )
    }
    return (
      <ThemeProvider theme={this.getTheme()}>
        <CssBaseline />
        <Head>
          <title>Симуляції</title>
        </Head>
      </ThemeProvider>
    )
  }
}

export default Home

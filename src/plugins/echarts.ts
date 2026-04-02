// ECharts Plugin Configuration for vue-echarts v8+
// vue-echarts requires explicitly registering ECharts components

import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    DataZoomComponent
} from 'echarts/components'

// Register necessary ECharts components globally
use([
    CanvasRenderer,
    LineChart,
    BarChart,
    PieChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    DataZoomComponent
])

import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels,
  ApexStroke, ApexTitleSubtitle, ApexTheme, ApexTooltip, ApexGrid, ApexYAxis
} from 'ng-apexcharts';
import { UserService } from '../../service/localStorage/user.service';
import { ExpenseService, Expense } from '../../service/localStorage/expense.service';

@Component({
  standalone: true,
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.css'],
  imports: [NgApexchartsModule]
})
export class GraphsComponent implements OnInit, OnChanges {

  @Input() viewType: 'month' | 'day' = 'month';
  @Input() currentDate!: Date;

  constructor(
    public userService: UserService,
    private expenseService: ExpenseService
  ) { }

  ngOnInit(): void {
    const userTheme = this.userService.getValue<string>('theme_mode');
    this.theme.mode = userTheme === 'dark' ? 'dark' : 'light';
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewType'] || changes['currentDate']) {
      this.loadData();
    }
  }

  chartSeries: ApexAxisChartSeries = [
    {
      name: "Expenses",
      data: []
    }
  ];

  chartYAxis: ApexYAxis = {
    show: true
  };

  grid: ApexGrid = {
    show: false
  };

  chartDetails: ApexChart = {
    type: "area",
    height: 350,
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    foreColor: 'var(--color-text)',
    background: 'transparent',
    animations: {
      enabled: true
    }
  };

  chartXAxis: ApexXAxis = {
    type: 'category',
    categories: [],
    tooltip: {
      enabled: false
    }
  };


  dataLabels: ApexDataLabels = {
    enabled: false
  };

  stroke: ApexStroke = {
    curve: "smooth"
  };

  title: ApexTitleSubtitle = {};

  theme: ApexTheme = {
    mode: 'light'
  };

  tooltip: ApexTooltip = {
    shared: true,
    intersect: false,
    y: {},
    x: {}
  };

  switchView(viewType: 'month' | 'day'): void {
    this.viewType = viewType;
    this.loadData();
  }

  loadData(): void {
    const expenses: Expense[] = this.expenseService.getAll();
    if (this.viewType === 'month') {
      this.loadMonthData(expenses);
    } else {
      this.loadDayData(expenses);
    }
  }

  loadMonthData(expenses: Expense[]): void {
    const dayAmountMap = new Map<number, number>();

    const currentYear = this.currentDate.getFullYear();
    const currentMonth = this.currentDate.getMonth() + 1;

    // dayAmountMap.set(1, 0);

    const currentMonthExpenses = expenses.filter(item => {
      const [year, month] = item.date.split('-').map(Number);
      return year === currentYear && month === currentMonth;
    });

    let totalAmount = 0;
    currentMonthExpenses.forEach(item => {
      const day = parseInt(item.date.split('-')[2]);
      const amount = item.amount;
      totalAmount += amount;

      if (dayAmountMap.has(day)) {
        dayAmountMap.set(day, dayAmountMap.get(day)! + amount);
      } else {
        dayAmountMap.set(day, amount);
      }
    });

    const days = Array.from(dayAmountMap.keys()).sort((a, b) => a - b);
    const amounts = days.map(day => dayAmountMap.get(day)!);

    this.tooltip = {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => {
          return `${value} ${this.userService.getValue<string>('currency')}`;
        }
      },
      x: {
        formatter: (value: any) => {
          const day = days[value - 1];
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const monthName = monthNames[this.currentDate.getMonth()];
          const year = this.currentDate.getFullYear();
          return `${day} ${monthName} ${year}`;
        }
      }
    };

    this.title = {
      text: "Monthly Expenses: " + totalAmount,
      align: "center",
      style: {
        color: 'var(--color-text)'
      }
    };

    this.chartXAxis = {
      type: 'category',
      categories: days.map(day => day.toString()),
      tooltip: {
        enabled: false
      }
    };

    this.chartSeries = [{
      name: "Expenses",
      data: amounts
    }];
  }

  loadDayData(expenses: Expense[]): void {
    const timeAmountMap = new Map<string, number>();

    const todayStr = `${this.currentDate.getFullYear()}-${(this.currentDate.getMonth() + 1).toString().padStart(2, '0')}-${this.currentDate.getDate().toString().padStart(2, '0')}`;

    const todaysExpenses = expenses.filter(exp => exp.date === todayStr);

    todaysExpenses.sort((a, b) => {
      const [aHours, aMinutes, aSeconds] = a.time.split(":").map(Number);
      const [bHours, bMinutes, bSeconds] = b.time.split(":").map(Number);

      if (aHours !== bHours) return aHours - bHours;
      if (aMinutes !== bMinutes) return aMinutes - bMinutes;
      return aSeconds - bSeconds;
    });


    // timeAmountMap.set("00:00:00", 0);
    let totalAmount = 0;
    todaysExpenses.forEach(item => {
      const [hour, minute, second] = item.time.split(":");
      const time = `${hour}:${minute}:${second}`;
      totalAmount += item.amount;
      timeAmountMap.set(time, item.amount);
    });

    const times = Array.from(timeAmountMap.keys());
    const amounts = times.map(time => timeAmountMap.get(time)!);

    this.tooltip = {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => {
          return `${value} ${this.userService.getValue<string>('currency')}`;
        }
      },
      x: {
        formatter: (value: any) => {
          const time = times[value - 1];
          return `Time: ${time}`;
        }
      }
    };

    this.title = {
      text: "Today Expenses: " + totalAmount,
      align: "center",
      style: {
        color: 'var(--color-text)'
      }
    };

    this.chartXAxis = {
      type: 'category',
      categories: times,
      tooltip: {
        enabled: false
      }
    };

    this.chartSeries = [{
      name: "Expenses",
      data: amounts
    }];
  }

}

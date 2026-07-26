import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  CloudSun,
  Compass,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Footprints,
  Heart,
  Home,
  Hotel,
  Landmark,
  Map,
  MapPin,
  Navigation,
  Plus,
  ReceiptText,
  RefreshCw,
  Share2,
  ShipWheel,
  Sparkles,
  Ticket,
  TrainFront,
  Trash2,
  Utensils,
  WalletCards,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  loadTrip,
  saveTrip,
  subscribeTrip,
  type SyncMode,
} from "./lib/trip-storage";
import beijingMapArt from "/beijing-map-art.jpg";

type View = "overview" | "itinerary" | "map" | "budget";
type Modal = "item" | "expense" | "share" | null;

type TripItem = {
  id: string;
  time: string;
  duration: string;
  title: string;
  location: string;
  type: string;
  notes: string;
  distance: string;
  cost: number;
  booked: boolean;
  done: boolean;
  favorite: boolean;
  color: string;
  sourceLabel?: string;
  sourceUrl?: string;
};

type TripDay = {
  id: string;
  label: string;
  date: string;
  city: string;
  theme: string;
  weather: string;
  items: TripItem[];
};

type Expense = {
  id: string;
  name: string;
  category: "交通" | "住宿" | "餐饮" | "体验";
  amount: number;
  paidBy: string;
};

type TripData = {
  destination: string;
  subtitle: string;
  dates: string;
  budget: number;
  budgetVisible?: boolean;
  updatedAt: number;
  notes: string;
  days: TripDay[];
  expenses: Expense[];
  checklist: { id: string; text: string; done: boolean }[];
};

type MapPlace = {
  id: string;
  name: string;
  detail: string;
  day: string;
  color: string;
  left: string;
  top: string;
  labelSide?: "left";
};

const TRIP_START_DATE = "2026-08-01";

const mapPlaces: MapPlace[] = [
  {
    id: "drum-tower",
    name: "鼓楼",
    detail: "北京鼓楼",
    day: "周日",
    color: "#324e5f",
    left: "50%",
    top: "13%",
    labelSide: "left",
  },
  {
    id: "shichahai",
    name: "什刹海",
    detail: "什刹海 · 烟袋斜街",
    day: "周日",
    color: "#324e5f",
    left: "28%",
    top: "25%",
  },
  {
    id: "jingshan",
    name: "景山公园",
    detail: "万春亭",
    day: "周日",
    color: "#1e4a3b",
    left: "50%",
    top: "31%",
    labelSide: "left",
  },
  {
    id: "forbidden-city",
    name: "故宫",
    detail: "午门至神武门",
    day: "周日",
    color: "#d6a446",
    left: "50%",
    top: "45%",
  },
  {
    id: "national-museum",
    name: "国家博物馆",
    detail: "天安门广场东侧",
    day: "周六",
    color: "#1e4a3b",
    left: "58%",
    top: "58%",
  },
  {
    id: "qianmen",
    name: "前门大街",
    detail: "鲜鱼口 · 大栅栏 · 北京坊",
    day: "周六",
    color: "#c85d3e",
    left: "49%",
    top: "68%",
    labelSide: "left",
  },
  {
    id: "quanjude",
    name: "全聚德前门店",
    detail: "前门大街 30 号",
    day: "周六",
    color: "#c85d3e",
    left: "55%",
    top: "76%",
  },
];

const DEFAULT_TRIP: TripData = {
  destination: "北京 · 古城周末",
  subtitle: "从前门到故宫，在夏日古都里走一条松弛的中轴线。",
  dates: "周六 — 周日",
  budget: 4000,
  budgetVisible: true,
  updatedAt: 1,
  notes:
    "前门尽量早逛，避开中午暑热和最大客流。国博只精选“古代中国”与一个专题展，结束后回酒店休息一小时。周日故宫从午门进入、神武门出，顺路登景山。",
  days: [
    {
      id: "saturday",
      label: "周六",
      date: "SAT",
      city: "北京",
      theme: "前门 · 国博 · 夜晚剧场",
      weather: "夏日 · 注意防暑",
      items: [
        {
          id: "sat-1",
          time: "08:30",
          duration: "至 10:40",
          title: "前门街区晨间散步",
          location: "酒店 → 鲜鱼口 → 前门大街 → 大栅栏 → 北京坊",
          type: "漫步",
          notes: "尽量早逛，避开中午暑热和最大客流；从酒店步行串联几个街区。",
          distance: "约 4 km",
          cost: 0,
          booked: false,
          done: false,
          favorite: true,
          color: "#c85d3e",
        },
        {
          id: "sat-2",
          time: "11:00",
          duration: "至 12:30",
          title: "全聚德前门店午餐",
          location: "全聚德前门店",
          type: "餐饮",
          notes: "两人建议点“半只烤鸭＋一两个菜”，给晚上的 ZENG 留足胃口。",
          distance: "步行可达",
          cost: 520,
          booked: false,
          done: false,
          favorite: false,
          color: "#d6a446",
        },
        {
          id: "sat-3",
          time: "12:30",
          duration: "至 13:30",
          title: "前往国博 · 安检排队",
          location: "前门 → 中国国家博物馆",
          type: "交通",
          notes: "为步行、寄存、安检和暑期排队完整预留一小时，不压缩参观时间。",
          distance: "约 2 km",
          cost: 0,
          booked: false,
          done: false,
          favorite: false,
          color: "#324e5f",
        },
        {
          id: "sat-4",
          time: "13:30",
          duration: "至 16:30",
          title: "中国国家博物馆",
          location: "天安门广场东侧",
          type: "景点",
          notes:
            "三个小时只精选“古代中国”＋一个感兴趣的专题展，不追求全馆打卡。暑期开放至 17:30，16:30 停止入馆。",
          distance: "馆内步行",
          cost: 0,
          booked: true,
          done: false,
          favorite: true,
          color: "#1e4a3b",
          sourceLabel: "中国国家博物馆官网",
          sourceUrl: "https://www.chnmuseum.cn/",
        },
        {
          id: "sat-5",
          time: "16:30",
          duration: "至 18:00",
          title: "返回酒店休息",
          location: "国家博物馆 → 酒店",
          type: "住宿",
          notes: "不要继续硬逛。回酒店休息、洗漱一小时非常值得，也为晚餐恢复体力。",
          distance: "按酒店位置",
          cost: 0,
          booked: false,
          done: false,
          favorite: false,
          color: "#6d5b8c",
        },
        {
          id: "sat-6",
          time: "18:30",
          duration: "以后",
          title: "ZENG 餐厅剧场店",
          location: "ZENG 餐厅剧场店",
          type: "餐饮",
          notes: "轻松享用晚餐与剧场体验，白天午餐控制分量后会更舒服。",
          distance: "打车前往",
          cost: 680,
          booked: true,
          done: false,
          favorite: true,
          color: "#c85d3e",
        },
      ],
    },
    {
      id: "sunday",
      label: "周日",
      date: "SUN",
      city: "北京",
      theme: "故宫 · 景山 · 什刹海",
      weather: "夏日 · 注意防晒",
      items: [
        {
          id: "sun-1",
          time: "08:00",
          duration: "左右",
          title: "从酒店出发",
          location: "酒店 → 故宫午门",
          type: "交通",
          notes: "提前准备好证件、预约信息和饮水，留出前往午门及排队时间。",
          distance: "按酒店位置",
          cost: 20,
          booked: false,
          done: false,
          favorite: false,
          color: "#324e5f",
        },
        {
          id: "sun-2",
          time: "08:30",
          duration: "至 13:30",
          title: "故宫博物院",
          location: "午门 → 中轴线 → 东西六宫择一侧 → 御花园",
          type: "景点",
          notes:
            "旺季 08:30 开放、17:00 闭馆。从午门进入，最后由神武门离开，直接衔接景山最顺路。",
          distance: "约 6 km",
          cost: 120,
          booked: true,
          done: false,
          favorite: true,
          color: "#c85d3e",
          sourceLabel: "故宫参观信息",
          sourceUrl: "https://www.dpm.org.cn/Visit.html",
        },
        {
          id: "sun-3",
          time: "13:30",
          duration: "至 14:00",
          title: "故宫内简单补给",
          location: "御花园附近",
          type: "餐饮",
          notes: "简单吃点、补水并稍作休息，不安排正式午餐，避免行程被拖慢。",
          distance: "馆内",
          cost: 80,
          booked: false,
          done: false,
          favorite: false,
          color: "#d6a446",
        },
        {
          id: "sun-4",
          time: "14:00",
          duration: "至 15:15",
          title: "景山公园 · 万春亭",
          location: "神武门 → 景山公园",
          type: "景点",
          notes: "从神武门出，过街进入景山公园，登万春亭俯瞰故宫全景。",
          distance: "约 1.5 km",
          cost: 10,
          booked: false,
          done: false,
          favorite: true,
          color: "#1e4a3b",
        },
        {
          id: "sun-5",
          time: "15:30",
          duration: "至 16:30",
          title: "咖啡店休息避暑",
          location: "景山西侧或什刹海附近",
          type: "餐饮",
          notes: "完整坐下一小时，补水降温，等最热的时段过去再继续步行。",
          distance: "约 1 km",
          cost: 100,
          booked: false,
          done: false,
          favorite: false,
          color: "#d6a446",
        },
        {
          id: "sun-6",
          time: "16:30",
          duration: "至 19:30",
          title: "什刹海 · 烟袋斜街 · 鼓楼",
          location: "什刹海 → 烟袋斜街 → 鼓楼",
          type: "漫步",
          notes: "沿水边和胡同慢慢走，傍晚光线更舒服，途中顺便解决晚饭。",
          distance: "约 5 km",
          cost: 280,
          booked: false,
          done: false,
          favorite: true,
          color: "#324e5f",
        },
      ],
    },
  ],
  expenses: [
    { id: "e-1", name: "北京周末酒店", category: "住宿", amount: 1298, paidBy: "周文龙" },
    { id: "e-2", name: "全聚德前门店午餐", category: "餐饮", amount: 520, paidBy: "吴志宏" },
    { id: "e-3", name: "ZENG 餐厅剧场", category: "餐饮", amount: 680, paidBy: "周文龙" },
    { id: "e-4", name: "故宫与景山门票", category: "体验", amount: 130, paidBy: "吴志宏" },
    { id: "e-5", name: "市内交通预留", category: "交通", amount: 200, paidBy: "周文龙" },
  ],
  checklist: [
    { id: "c-1", text: "预约中国国家博物馆", done: false },
    { id: "c-2", text: "预约故宫门票", done: false },
    { id: "c-3", text: "确认 ZENG 餐厅剧场预订", done: false },
    { id: "c-4", text: "准备证件、防晒与饮水", done: false },
  ],
};

const navItems: { id: View; label: string; icon: typeof Home }[] = [
  { id: "overview", label: "旅程首页", icon: Home },
  { id: "itinerary", label: "每日行程", icon: CalendarDays },
  { id: "map", label: "地点地图", icon: Map },
  { id: "budget", label: "共同预算", icon: WalletCards },
];

const itemColors: Record<string, string> = {
  交通: "#324e5f",
  景点: "#1e4a3b",
  餐饮: "#c85d3e",
  体验: "#d6a446",
  漫步: "#c85d3e",
  住宿: "#6d5b8c",
};

function money(value: number) {
  return `¥${value.toLocaleString("zh-CN")}`;
}

function departureCountdown(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const departure = Date.UTC(year, month - 1, day);
  const days = Math.round((departure - today) / 86_400_000);

  if (days > 0) return `还有 ${days} 天出发`;
  if (days === 0) return "今天出发";
  return "旅程已开始";
}

export function TripPlanner() {
  const [view, setView] = useState<View>("overview");
  const [modal, setModal] = useState<Modal>(null);
  const [trip, setTrip] = useState<TripData>(DEFAULT_TRIP);
  const [activeDayId, setActiveDayId] = useState(DEFAULT_TRIP.days[0].id);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncMode, setSyncMode] = useState<SyncMode>("local");
  const [syncError, setSyncError] = useState("");
  const [toast, setToast] = useState("");
  const tripRef = useRef(trip);

  const activeDay =
    trip.days.find((day) => day.id === activeDayId) ?? trip.days[0];
  const spent = useMemo(
    () => trip.expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [trip.expenses],
  );
  const allPlaces = useMemo(
    () => trip.days.flatMap((day) => day.items.map((item) => ({ ...item, day }))),
    [trip.days],
  );
  const budgetVisible = trip.budgetVisible !== false;
  const visibleNavItems = budgetVisible
    ? navItems
    : navItems.filter((item) => item.id !== "budget");

  useEffect(() => {
    tripRef.current = trip;
  }, [trip]);

  useEffect(() => {
    let cancelled = false;
    loadTrip(DEFAULT_TRIP)
      .then(({ error, mode, trip: loadedTrip }) => {
        if (!cancelled) {
          setTrip(loadedTrip);
          setActiveDayId(loadedTrip.days?.[0]?.id ?? DEFAULT_TRIP.days[0].id);
          setSyncMode(mode);
          setSyncError(error ?? "");
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSyncMode("error");
          setSyncError(error instanceof Error ? error.message : "初始化同步失败");
        }
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      saveTrip(trip)
        .then((mode) => {
          setSyncMode(mode);
          setSyncError("");
        })
        .catch((error: unknown) => {
          setSyncMode("error");
          setSyncError(error instanceof Error ? error.message : "CloudBase 保存失败");
        })
        .finally(() => setSaving(false));
    }, 650);
    return () => window.clearTimeout(timer);
  }, [trip, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    let stopWatching: (() => void) | undefined;

    void subscribeTrip<TripData>(
      (remoteTrip) => {
        if (remoteTrip.updatedAt > tripRef.current.updatedAt) {
          setTrip(remoteTrip);
          showToast("已同步吴志宏的最新修改");
        }
        setSyncMode("cloud");
        setSyncError("");
      },
      (error) => {
        setSyncMode("error");
        setSyncError(error.message);
      },
    ).then((cleanup) => {
      if (cancelled) cleanup();
      else stopWatching = cleanup;
    });

    return () => {
      cancelled = true;
      stopWatching?.();
    };
  }, [hydrated]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function updateTrip(updater: (current: TripData) => TripData) {
    setSaving(true);
    setTrip((current) => ({
      ...updater(current),
      updatedAt: Date.now(),
    }));
  }

  function toggleItem(itemId: string, key: "done" | "favorite") {
    updateTrip((current) => ({
      ...current,
      days: current.days.map((day) => ({
        ...day,
        items: day.items.map((item) =>
          item.id === itemId ? { ...item, [key]: !item[key] } : item,
        ),
      })),
    }));
  }

  function removeItem(item: TripItem) {
    if (!window.confirm(`确定删除“${item.title}”吗？`)) return;
    updateTrip((current) => ({
      ...current,
      days: current.days.map((day) => ({
        ...day,
        items: day.items.filter((candidate) => candidate.id !== item.id),
      })),
    }));
    showToast("行程已删除");
  }

  function toggleChecklist(id: string) {
    updateTrip((current) => ({
      ...current,
      checklist: current.checklist.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    }));
  }

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const type = String(form.get("type") || "景点");
    const newItem: TripItem = {
      id: `i-${Date.now()}`,
      time: String(form.get("time") || "09:00"),
      duration: String(form.get("duration") || "1h"),
      title: String(form.get("title") || "新的目的地"),
      location: String(form.get("location") || "待补充位置"),
      type,
      notes: String(form.get("notes") || ""),
      distance: String(form.get("distance") || "—"),
      cost: Number(form.get("cost") || 0),
      booked: false,
      done: false,
      favorite: false,
      color: itemColors[type] ?? "#1e4a3b",
    };

    updateTrip((current) => ({
      ...current,
      days: current.days.map((day) =>
        day.id === activeDay.id
          ? { ...day, items: [...day.items, newItem] }
          : day,
      ),
    }));
    setModal(null);
    showToast("已加入当天行程");
  }

  function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newExpense: Expense = {
      id: `e-${Date.now()}`,
      name: String(form.get("name") || "新费用"),
      category: String(form.get("category") || "餐饮") as Expense["category"],
      amount: Number(form.get("amount") || 0),
      paidBy: String(form.get("paidBy") || "周文龙"),
    };
    updateTrip((current) => ({
      ...current,
      expenses: [newExpense, ...current.expenses],
    }));
    setModal(null);
    showToast("费用已记录");
  }

  function removeExpense(expense: Expense) {
    if (!window.confirm(`确定删除“${expense.name}”这笔费用吗？`)) return;
    updateTrip((current) => ({
      ...current,
      expenses: current.expenses.filter(
        (candidate) => candidate.id !== expense.id,
      ),
    }));
    showToast("费用已删除");
  }

  function toggleBudgetVisibility() {
    const nextVisible = !budgetVisible;
    updateTrip((current) => ({
      ...current,
      budgetVisible: nextVisible,
    }));
    if (!nextVisible) setView("overview");
    showToast(nextVisible ? "共同预算已显示" : "共同预算已隐藏");
  }

  function copyShareCode() {
    navigator.clipboard
      ?.writeText("BEIJING-WEEKEND")
      .then(() => showToast("共享码已复制"))
      .catch(() => showToast("共享码：BEIJING-WEEKEND"));
  }

  function renderSchedule(showHeader = true): ReactNode {
    return (
      <section className="section-card section-pad">
        {showHeader && (
          <div className="section-head">
            <div>
              <div className="section-kicker">Itinerary</div>
              <h2 className="section-title">今日路线</h2>
              <div className="section-sub">两个人的脚步，已经排得刚刚好。</div>
            </div>
            <div className="day-tabs" aria-label="选择行程日期">
              {trip.days.map((day) => (
                <button
                  className={`day-tab ${day.id === activeDay.id ? "active" : ""}`}
                  key={day.id}
                  onClick={() => setActiveDayId(day.id)}
                  type="button"
                >
                  <strong>{day.label.replace("DAY ", "D")}</strong>
                  <small>{day.date}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        {!showHeader && (
          <div className="day-tabs" aria-label="选择行程日期">
            {trip.days.map((day) => (
              <button
                className={`day-tab ${day.id === activeDay.id ? "active" : ""}`}
                key={day.id}
                onClick={() => setActiveDayId(day.id)}
                type="button"
              >
                <strong>{day.label}</strong>
                <small>{day.date}</small>
              </button>
            ))}
          </div>
        )}

        <div className="day-intro" style={{ marginTop: showHeader ? undefined : 22 }}>
          <strong>{activeDay.theme}</strong>
          <div className="weather">
            <CloudSun size={15} />
            {activeDay.weather}
          </div>
        </div>

        <div className="timeline">
          {activeDay.items.map((item) => (
            <article className="trip-item" key={item.id}>
              <div className="trip-time">
                <strong>{item.time}</strong>
                <small>{item.duration}</small>
              </div>
              <span
                className="trip-dot"
                style={{ "--item-color": item.color } as CSSProperties}
              />
              <div className={`trip-card ${item.done ? "done" : ""}`}>
                <div className="trip-card-top">
                  <div>
                    <h3>{item.title}</h3>
                    <div className="location-row">
                      <MapPin size={12} />
                      <span>{item.location}</span>
                      <span className="trip-type">{item.type}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button
                      aria-label={item.favorite ? "取消收藏" : "收藏行程"}
                      className={`tiny-button ${item.favorite ? "active" : ""}`}
                      onClick={() => toggleItem(item.id, "favorite")}
                      type="button"
                    >
                      <Heart fill={item.favorite ? "currentColor" : "none"} size={14} />
                    </button>
                    <button
                      aria-label={item.done ? "标记未完成" : "标记完成"}
                      className={`tiny-button ${item.done ? "active" : ""}`}
                      onClick={() => toggleItem(item.id, "done")}
                      type="button"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      aria-label={`删除${item.title}`}
                      className="tiny-button danger"
                      onClick={() => removeItem(item)}
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {item.notes && <p className="trip-note">{item.notes}</p>}
                <div className="meta-row">
                  <span><Footprints size={12} />{item.distance}</span>
                  <span><CircleDollarSign size={12} />{money(item.cost)}</span>
                  {item.booked && <span><Ticket size={12} />已预订</span>}
                  {item.sourceUrl && (
                    <a
                      className="source-link"
                      href={item.sourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <ExternalLink size={11} />
                      {item.sourceLabel}
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        <button className="add-row" onClick={() => setModal("item")} type="button">
          <Plus size={15} />
          添加一站
        </button>
      </section>
    );
  }

  function renderMiniMap(large = false) {
    return (
      <div className={large ? "map-view-card" : ""}>
        <div
          className="map-card"
          style={{ "--map-image": `url(${beijingMapArt})` } as CSSProperties}
        >
          <div className="map-toolbar">
            <strong>北京中轴线</strong>
            <a
              aria-label="在高德地图打开路线"
              className="icon-button"
              href="https://wia.amap.com/#/map?orgId=10017639980195568214&workMapId=1763998222564620"
              rel="noreferrer"
              target="_blank"
            >
              <Navigation size={15} />
            </a>
          </div>
          <div className="map-route" />
          {mapPlaces.map((place, index) => (
            <div
              aria-label={`${index + 1}，${place.name}`}
              className={`map-marker ${place.labelSide === "left" ? "label-left" : ""}`}
              key={place.id}
              role="img"
              style={
                {
                  "--marker-color": place.color,
                  "--marker-left": place.left,
                  "--marker-top": place.top,
                } as CSSProperties
              }
            >
              <span className="map-marker-pin"><span>{index + 1}</span></span>
              <strong>{place.name}</strong>
            </div>
          ))}
          <div className="map-caption">
            <div>
              <strong>{mapPlaces.length} 个地图地点</strong>
              <small>前门 → 国博 → 故宫 → 景山 → 什刹海</small>
            </div>
            <Compass size={18} />
          </div>
        </div>
      </div>
    );
  }

  function renderOverview() {
    return (
      <>
        <section className="hero">
          <div className="hero-ribbon" />
          <div className="eyebrow"><span className="eyebrow-line" />BEIJING WEEKEND · 2026</div>
          <h1>去北京，<em>逛古都。</em></h1>
          <p className="hero-copy">{trip.subtitle}</p>
          <div className="hero-bottom">
            <div className="hero-stats">
              <div className="hero-stat"><span>日期</span><strong>周六 — 周日</strong></div>
              <div className="hero-stat"><span>同行</span><strong>2 人</strong></div>
              <div className="hero-stat"><span>路线</span><strong>中轴线</strong></div>
            </div>
            <div className="hero-actions">
              <button className="ghost-button light" onClick={() => setModal("share")} type="button">
                <Share2 size={14} />邀请搭档
              </button>
              <button className="primary-button" onClick={() => setModal("item")} type="button">
                <Plus size={15} />添加行程
              </button>
            </div>
          </div>
        </section>

        <div className="content-grid">
          {renderSchedule()}
          <aside className="side-stack">
            {renderMiniMap()}
            <section className="section-card section-pad note-card">
              <div className="section-kicker">Travel note</div>
              <h2 className="section-title">灵感便签</h2>
              <textarea
                aria-label="旅行灵感便签"
                onChange={(event) =>
                  updateTrip((current) => ({ ...current, notes: event.target.value }))
                }
                value={trip.notes}
              />
            </section>
            <section className="section-card section-pad">
              <div className="section-head" style={{ marginBottom: 8 }}>
                <div>
                  <div className="section-kicker">Before departure</div>
                  <h2 className="section-title">出发清单</h2>
                </div>
                <span className="trip-type">
                  {trip.checklist.filter((item) => item.done).length}/{trip.checklist.length}
                </span>
              </div>
              <div className="checklist">
                {trip.checklist.map((item) => (
                  <div className={`check-row ${item.done ? "done" : ""}`} key={item.id}>
                    <button
                      aria-label={`${item.done ? "取消完成" : "完成"}${item.text}`}
                      onClick={() => toggleChecklist(item.id)}
                      type="button"
                    >
                      {item.done && <Check size={12} />}
                    </button>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </>
    );
  }

  function renderItinerary() {
    const completed = allPlaces.filter((item) => item.done).length;
    return (
      <>
        <div className="view-heading">
          <div>
            <div className="section-kicker">Daily rhythm</div>
            <h1>每日行程</h1>
            <p>{trip.dates} · {allPlaces.length} 个安排 · {completed} 个已完成</p>
          </div>
          <button className="primary-button" onClick={() => setModal("item")} type="button">
            <Plus size={15} /><span>添加安排</span>
          </button>
        </div>
        <div className="wide-layout">
          {renderSchedule(false)}
          <aside className="side-stack">
            <section className="section-card section-pad">
              <div className="section-kicker">Day at a glance</div>
              <h2 className="section-title">{activeDay.city} · {activeDay.date}</h2>
              <div className="section-sub">{activeDay.theme}</div>
              <div className="category-grid" style={{ marginTop: 18 }}>
                <Metric icon={<MapPin size={15} />} label="地点" value={`${activeDay.items.length} 处`} />
                <Metric icon={<Footprints size={15} />} label="步行" value="约 12 km" />
                <Metric icon={<CloudSun size={15} />} label="天气" value={activeDay.weather.split(" ")[0]} />
                <Metric icon={<WalletCards size={15} />} label="预计" value={money(activeDay.items.reduce((sum, item) => sum + item.cost, 0))} />
              </div>
            </section>
            {renderMiniMap()}
          </aside>
        </div>
      </>
    );
  }

  function renderMapView() {
    return (
      <>
        <div className="view-heading">
          <div>
            <div className="section-kicker">Places & route</div>
            <h1>地点地图</h1>
            <p>把散落的心动地点，串成一条舒服的路线。</p>
          </div>
          <button className="primary-button" onClick={() => setModal("item")} type="button">
            <MapPin size={15} /><span>收藏地点</span>
          </button>
        </div>
        <div className="wide-layout">
          {renderMiniMap(true)}
          <section className="section-card section-pad">
            <div className="section-head">
              <div>
                <div className="section-kicker">Saved places</div>
                <h2 className="section-title">路线上的地点</h2>
              </div>
              <span className="trip-type">{mapPlaces.length} 个</span>
            </div>
            <div className="place-list">
              {mapPlaces.map((place, index) => (
                <div className="place-row" key={place.id}>
                  <span className="place-index" style={{ background: place.color }}>{index + 1}</span>
                  <div>
                    <strong>{place.name}</strong>
                    <small>{place.day} · {place.detail}</small>
                  </div>
                  <ChevronRight size={14} style={{ marginLeft: "auto", color: "#8a928b" }} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </>
    );
  }

  function renderBudget() {
    const categories: Expense["category"][] = ["交通", "住宿", "餐饮", "体验"];
    return (
      <>
        <div className="view-heading">
          <div>
            <div className="section-kicker">Shared expenses</div>
            <h1>共同预算</h1>
            <p>花在哪里，两个人都清清楚楚。</p>
          </div>
          <button className="primary-button" onClick={() => setModal("expense")} type="button">
            <Plus size={15} /><span>记一笔</span>
          </button>
        </div>
        <div className="wide-layout">
          <section className="section-card section-pad">
            <div className="section-head">
              <div>
                <div className="section-kicker">Expense log</div>
                <h2 className="section-title">费用明细</h2>
              </div>
              <span className="trip-type">{trip.expenses.length} 笔</span>
            </div>
            <div className="expense-list">
              {trip.expenses.map((expense) => (
                <div className="expense-row" key={expense.id}>
                  <div>
                    <strong>{expense.name}</strong>
                    <small>{expense.category}</small>
                  </div>
                  <span className="expense-amount">{money(expense.amount)}</span>
                  <span className="paid-chip">{expense.paidBy} 已付</span>
                  <button
                    aria-label={`删除${expense.name}`}
                    className="expense-delete"
                    onClick={() => removeExpense(expense)}
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
          <aside className="side-stack">
            <section className="budget-hero">
              <div className="eyebrow">TRIP BUDGET</div>
              <div className="budget-number">{money(spent)}</div>
              <div className="hero-copy">已记录旅行支出</div>
              <div className="budget-track">
                <span style={{ width: `${Math.min(100, (spent / trip.budget) * 100)}%` }} />
              </div>
              <div className="budget-meta">
                <span>已用 {Math.round((spent / trip.budget) * 100)}%</span>
                <span>预算 {money(trip.budget)}</span>
              </div>
            </section>
            <section className="section-card section-pad">
              <div className="section-kicker">By category</div>
              <h2 className="section-title" style={{ marginBottom: 18 }}>分类支出</h2>
              <div className="category-grid">
                {categories.map((category) => (
                  <Metric
                    icon={categoryIcon(category)}
                    key={category}
                    label={category}
                    value={money(
                      trip.expenses
                        .filter((expense) => expense.category === category)
                        .reduce((sum, expense) => sum + expense.amount, 0),
                    )}
                  />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><ShipWheel size={20} /></span>
          <div className="brand-copy">
            <div className="brand-name">漫行</div>
            <div className="brand-sub">MANXING</div>
          </div>
        </div>

        <div className="nav-label">旅程空间</div>
        <nav className="nav-list" aria-label="主要导航">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`nav-item ${view === item.id ? "active" : ""}`}
                key={item.id}
                onClick={() => setView(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-trip">
          <div className="sidebar-trip-label">下一次旅行</div>
          <div className="mini-route">
            <span className="mini-route-dot" />
            <span className="mini-route-line" />
            <Navigation size={14} />
          </div>
          <strong>{trip.destination}</strong>
          <small>{departureCountdown(TRIP_START_DATE)}</small>
        </div>

        <div className="sidebar-footer">
          <span className="avatar online">龙</span>
          <div className="profile-copy"><strong>周文龙</strong><small>行程创建者</small></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="sync-pill" title={syncError || undefined}>
            <span className={`sync-dot ${saving ? "saving" : syncMode}`} />
            {saving
              ? "正在同步"
              : syncMode === "cloud"
                ? "已与吴志宏实时同步"
                : syncMode === "error"
                  ? "同步异常 · 本地已保存"
                  : "本地预览 · 待配置 CloudBase"}
          </div>
          <button
            aria-label="刷新同步"
            className="icon-button"
            onClick={() => window.location.reload()}
            type="button"
          >
            <RefreshCw size={15} />
          </button>
          <button aria-label="通知" className="icon-button" onClick={() => showToast("暂无新通知")} type="button">
            <Bell size={15} />
          </button>
          <button aria-label="分享行程" className="icon-button" onClick={() => setModal("share")} type="button">
            <Share2 size={15} />
          </button>
          <div className="member-group" aria-label="同行成员">
            <span className="avatar online">龙</span>
            <span className="avatar alt online">宏</span>
          </div>
        </header>

        {view === "overview" && renderOverview()}
        {view === "itinerary" && renderItinerary()}
        {view === "map" && renderMapView()}
        {view === "budget" && budgetVisible && renderBudget()}
      </main>

      <nav
        className={`mobile-nav ${budgetVisible ? "" : "compact"}`}
        aria-label="移动端导航"
      >
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={view === item.id ? "active" : ""}
              key={item.id}
              onClick={() => setView(item.id)}
              type="button"
            >
              <Icon size={19} />
              {item.label.replace("旅程", "").replace("每日", "").replace("地点", "").replace("共同", "")}
            </button>
          );
        })}
      </nav>

      {modal === "item" && (
        <ModalShell
          description={`添加到 ${activeDay.label} · ${activeDay.city}`}
          onClose={() => setModal(null)}
          title="添加一站"
        >
          <form onSubmit={addItem}>
            <div className="form-grid">
              <Field label="名称" name="title" placeholder="例如：海边日落" required wide />
              <Field label="开始时间" name="time" type="time" defaultValue="09:00" />
              <Field label="预计时长" name="duration" placeholder="例如：1h 30m" defaultValue="1h" />
              <Field label="地点" name="location" placeholder="地址或地标" wide />
              <div className="field">
                <label htmlFor="type">类型</label>
                <select defaultValue="景点" id="type" name="type">
                  {["景点", "餐饮", "交通", "体验", "漫步", "住宿"].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <Field label="预计费用" name="cost" placeholder="0" type="number" />
              <Field label="距离" name="distance" placeholder="例如：3.2 km" wide />
              <div className="field wide">
                <label htmlFor="notes">备注</label>
                <textarea id="notes" name="notes" placeholder="写下预约信息、路线或想一起做的事…" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="ghost-button" onClick={() => setModal(null)} type="button">取消</button>
              <button className="primary-button" type="submit"><Plus size={14} />加入行程</button>
            </div>
          </form>
        </ModalShell>
      )}

      {modal === "expense" && (
        <ModalShell
          description="新增支出后，会自动更新共同预算"
          onClose={() => setModal(null)}
          title="记录一笔"
        >
          <form onSubmit={addExpense}>
            <div className="form-grid">
              <Field label="费用名称" name="name" placeholder="例如：酒店订金" required wide />
              <div className="field">
                <label htmlFor="category">分类</label>
                <select defaultValue="餐饮" id="category" name="category">
                  {["交通", "住宿", "餐饮", "体验"].map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <Field label="金额" name="amount" placeholder="0" required type="number" />
              <div className="field wide">
                <label htmlFor="paidBy">付款人</label>
                <select defaultValue="周文龙" id="paidBy" name="paidBy">
                  <option value="周文龙">周文龙</option>
                  <option value="吴志宏">吴志宏</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="ghost-button" onClick={() => setModal(null)} type="button">取消</button>
              <button className="primary-button" type="submit"><ReceiptText size={14} />保存费用</button>
            </div>
          </form>
        </ModalShell>
      )}

      {modal === "share" && (
        <ModalShell
          description="只有拿到共享码的人才能进入这趟旅行"
          onClose={() => setModal(null)}
          title="邀请旅行搭档"
        >
          <div className="share-code">
            <small>TRIP SHARE CODE</small>
            <strong>BEIJING-WEEKEND</strong>
          </div>
          <div className="share-members">
            <div className="member-group">
              <span className="avatar online">龙</span>
              <span className="avatar alt online">宏</span>
            </div>
            <small>2 位成员 · 均可编辑</small>
          </div>
          <button
            aria-pressed={budgetVisible}
            className="setting-toggle"
            onClick={toggleBudgetVisibility}
            type="button"
          >
            <span className="setting-toggle-icon">
              {budgetVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            </span>
            <span>
              <strong>共同预算</strong>
              <small>{budgetVisible ? "显示在导航中" : "已从导航中隐藏"}</small>
            </span>
            <span className={`switch-track ${budgetVisible ? "on" : ""}`}>
              <span />
            </span>
          </button>
          <div className="modal-actions">
            <button className="ghost-button" onClick={() => setModal(null)} type="button">完成</button>
            <button className="primary-button" onClick={copyShareCode} type="button"><Copy size={14} />复制共享码</button>
          </div>
        </ModalShell>
      )}

      {toast && <div className="toast"><Sparkles size={15} />{toast}</div>}
    </div>
  );
}

function ModalShell({
  children,
  description,
  onClose,
  title,
}: {
  children: ReactNode;
  description: string;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div aria-modal="true" className="modal" role="dialog">
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <button aria-label="关闭弹窗" className="icon-button" onClick={onClose} type="button"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  defaultValue,
  label,
  name,
  placeholder,
  required,
  type = "text",
  wide,
}: {
  defaultValue?: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  wide?: boolean;
}) {
  return (
    <div className={`field ${wide ? "wide" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <input
        defaultValue={defaultValue}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="category-card">
      <span className="category-icon">{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function categoryIcon(category: Expense["category"]) {
  if (category === "交通") return <TrainFront size={15} />;
  if (category === "住宿") return <Hotel size={15} />;
  if (category === "餐饮") return <Utensils size={15} />;
  return <Landmark size={15} />;
}

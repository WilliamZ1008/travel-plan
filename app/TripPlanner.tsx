"use client";

import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  CloudSun,
  Compass,
  Copy,
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
  updatedAt: number;
  notes: string;
  days: TripDay[];
  expenses: Expense[];
  checklist: { id: string; text: string; done: boolean }[];
};

const DEFAULT_TRIP: TripData = {
  destination: "厦门 · 泉州",
  subtitle: "在海风与古城之间，慢慢走，认真吃。",
  dates: "2026.08.15 — 08.18",
  budget: 6000,
  updatedAt: 1,
  notes: "想看一次鼓浪屿的日落。泉州那天记得穿舒服的鞋，晚上去吃面线糊。",
  days: [
    {
      id: "day-1",
      label: "DAY 01",
      date: "08 / 15",
      city: "厦门",
      theme: "抵达 · 城市初见",
      weather: "29° 晴间多云",
      items: [
        {
          id: "i-1",
          time: "10:30",
          duration: "1h 10m",
          title: "抵达厦门北站",
          location: "厦门北站 · 集美区",
          type: "交通",
          notes: "提前在 12306 候车室碰面，出站后直接打车去酒店。",
          distance: "28 km",
          cost: 86,
          booked: true,
          done: false,
          favorite: false,
          color: "#324e5f",
        },
        {
          id: "i-2",
          time: "13:00",
          duration: "1h 30m",
          title: "沙坡尾 · 午后散步",
          location: "大学路 31 号",
          type: "漫步",
          notes: "沿避风坞慢慢走，经过艺术西区和老巷子，找一家靠窗的咖啡店。",
          distance: "3.2 km",
          cost: 68,
          booked: false,
          done: false,
          favorite: true,
          color: "#c85d3e",
        },
        {
          id: "i-3",
          time: "17:40",
          duration: "2h",
          title: "环岛路骑行看日落",
          location: "黄厝海滩",
          type: "体验",
          notes: "从曾厝垵往黄厝方向骑，日落前 30 分钟到海边。备一件薄外套。",
          distance: "8.6 km",
          cost: 45,
          booked: false,
          done: false,
          favorite: false,
          color: "#d6a446",
        },
      ],
    },
    {
      id: "day-2",
      label: "DAY 02",
      date: "08 / 16",
      city: "厦门",
      theme: "海岛 · 日落收集",
      weather: "28° 多云",
      items: [
        {
          id: "i-4",
          time: "08:10",
          duration: "4h",
          title: "鼓浪屿散步地图",
          location: "三丘田码头",
          type: "景点",
          notes: "从三丘田上岛，先走最美转角，再去八卦楼和日光岩。",
          distance: "6.8 km",
          cost: 180,
          booked: true,
          done: false,
          favorite: true,
          color: "#1e4a3b",
        },
        {
          id: "i-5",
          time: "15:30",
          duration: "2h",
          title: "中山路觅食",
          location: "中山路步行街",
          type: "餐饮",
          notes: "花生汤、海蛎煎、沙茶面各选一家，两个人分着吃。",
          distance: "2.1 km",
          cost: 128,
          booked: false,
          done: false,
          favorite: false,
          color: "#c85d3e",
        },
      ],
    },
    {
      id: "day-3",
      label: "DAY 03",
      date: "08 / 17",
      city: "泉州",
      theme: "古城 · 一半烟火一半仙",
      weather: "30° 晴",
      items: [
        {
          id: "i-6",
          time: "09:00",
          duration: "1h",
          title: "动车前往泉州",
          location: "厦门北 → 泉州",
          type: "交通",
          notes: "车票开售后立即购买，选相邻座位。",
          distance: "82 km",
          cost: 78,
          booked: false,
          done: false,
          favorite: false,
          color: "#324e5f",
        },
        {
          id: "i-7",
          time: "11:00",
          duration: "5h",
          title: "泉州古城漫游",
          location: "开元寺 · 西街 · 钟楼",
          type: "景点",
          notes: "从开元寺开始，沿西街一路吃到钟楼，傍晚去天台看古城。",
          distance: "7.3 km",
          cost: 150,
          booked: false,
          done: false,
          favorite: true,
          color: "#d6a446",
        },
      ],
    },
    {
      id: "day-4",
      label: "DAY 04",
      date: "08 / 18",
      city: "泉州",
      theme: "清晨 · 带故事回家",
      weather: "29° 阵雨",
      items: [
        {
          id: "i-8",
          time: "08:30",
          duration: "2h",
          title: "蟳埔村簪花围",
          location: "蟳埔民俗文化村",
          type: "体验",
          notes: "早点到避开人流，提前一天确认预约和服装。",
          distance: "10 km",
          cost: 298,
          booked: false,
          done: false,
          favorite: true,
          color: "#c85d3e",
        },
      ],
    },
  ],
  expenses: [
    { id: "e-1", name: "往返动车票", category: "交通", amount: 986, paidBy: "阿澈" },
    { id: "e-2", name: "厦门海边民宿 · 2晚", category: "住宿", amount: 1088, paidBy: "小满" },
    { id: "e-3", name: "鼓浪屿船票", category: "体验", amount: 140, paidBy: "阿澈" },
    { id: "e-4", name: "泉州古城酒店", category: "住宿", amount: 468, paidBy: "小满" },
    { id: "e-5", name: "沙坡尾下午茶", category: "餐饮", amount: 126, paidBy: "阿澈" },
  ],
  checklist: [
    { id: "c-1", text: "预订鼓浪屿船票", done: true },
    { id: "c-2", text: "购买泉州动车票", done: false },
    { id: "c-3", text: "预约簪花围写真", done: false },
    { id: "c-4", text: "准备防晒与雨伞", done: true },
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

export function TripPlanner() {
  const [view, setView] = useState<View>("overview");
  const [modal, setModal] = useState<Modal>(null);
  const [trip, setTrip] = useState<TripData>(DEFAULT_TRIP);
  const [activeDayId, setActiveDayId] = useState(DEFAULT_TRIP.days[0].id);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    tripRef.current = trip;
  }, [trip]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/trip")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.trip) {
          setTrip(data.trip);
          setActiveDayId(data.trip.days?.[0]?.id ?? DEFAULT_TRIP.days[0].id);
        }
      })
      .catch(() => undefined)
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
      fetch("/api/trip", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ trip }),
      })
        .catch(() => undefined)
        .finally(() => setSaving(false));
    }, 650);
    return () => window.clearTimeout(timer);
  }, [trip, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const interval = window.setInterval(() => {
      fetch("/api/trip")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (data?.trip?.updatedAt > tripRef.current.updatedAt) {
            setTrip(data.trip);
            showToast("已同步搭档的最新修改");
          }
        })
        .catch(() => undefined);
    }, 10_000);
    return () => window.clearInterval(interval);
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
      paidBy: String(form.get("paidBy") || "阿澈"),
    };
    updateTrip((current) => ({
      ...current,
      expenses: [newExpense, ...current.expenses],
    }));
    setModal(null);
    showToast("费用已记录");
  }

  function copyShareCode() {
    navigator.clipboard
      ?.writeText("MANXING-0815")
      .then(() => showToast("共享码已复制"))
      .catch(() => showToast("共享码：MANXING-0815"));
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
                  </div>
                </div>
                {item.notes && <p className="trip-note">{item.notes}</p>}
                <div className="meta-row">
                  <span><Footprints size={12} />{item.distance}</span>
                  <span><CircleDollarSign size={12} />{money(item.cost)}</span>
                  {item.booked && <span><Ticket size={12} />已预订</span>}
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
        <div className="map-card">
          <div className="map-toolbar">
            <strong>海岸路线</strong>
            <button
              aria-label="打开地点地图"
              className="icon-button"
              onClick={() => setView("map")}
              type="button"
            >
              <Navigation size={15} />
            </button>
          </div>
          <div className="map-route" />
          <button aria-label="沙坡尾" className="map-pin one" type="button"><span>1</span></button>
          <button aria-label="鼓浪屿" className="map-pin two" type="button"><span>2</span></button>
          <button aria-label="环岛路" className="map-pin three" type="button"><span>3</span></button>
          <button aria-label="泉州古城" className="map-pin four" type="button"><span>4</span></button>
          <div className="map-caption">
            <div>
              <strong>{allPlaces.length} 个心动地点</strong>
              <small>厦门 → 泉州 · 约 126 km</small>
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
          <div className="eyebrow"><span className="eyebrow-line" />SUMMER ESCAPE · 2026</div>
          <h1>去闽南，<em>吹海风。</em></h1>
          <p className="hero-copy">{trip.subtitle}</p>
          <div className="hero-bottom">
            <div className="hero-stats">
              <div className="hero-stat"><span>日期</span><strong>08.15 — 18</strong></div>
              <div className="hero-stat"><span>同行</span><strong>2 人</strong></div>
              <div className="hero-stat"><span>目的地</span><strong>2 城</strong></div>
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
              <span className="trip-type">{allPlaces.length} 个</span>
            </div>
            <div className="place-list">
              {allPlaces.slice(0, 8).map((item, index) => (
                <div className="place-row" key={item.id}>
                  <span className="place-index" style={{ background: item.color }}>{index + 1}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.day.label} · {item.location}</small>
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
          {navItems.map((item) => {
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
          <small>还有 20 天出发</small>
        </div>

        <div className="sidebar-footer">
          <span className="avatar online">澈</span>
          <div className="profile-copy"><strong>阿澈</strong><small>行程创建者</small></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="sync-pill">
            <span className={`sync-dot ${saving ? "saving" : ""}`} />
            {saving ? "正在同步" : "已与小满同步"}
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
            <span className="avatar online">澈</span>
            <span className="avatar alt online">满</span>
          </div>
        </header>

        {view === "overview" && renderOverview()}
        {view === "itinerary" && renderItinerary()}
        {view === "map" && renderMapView()}
        {view === "budget" && renderBudget()}
      </main>

      <nav className="mobile-nav" aria-label="移动端导航">
        {navItems.map((item) => {
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
                <select defaultValue="阿澈" id="paidBy" name="paidBy">
                  <option value="阿澈">阿澈</option>
                  <option value="小满">小满</option>
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
            <strong>MANXING-0815</strong>
          </div>
          <div className="share-members">
            <div className="member-group">
              <span className="avatar online">澈</span>
              <span className="avatar alt online">满</span>
            </div>
            <small>2 位成员 · 均可编辑</small>
          </div>
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

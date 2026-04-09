# 🎨 Parent Portal - UI/UX Design Guide

## Frontend Team - Design Specifications

---

## 📱 Page 1: LOGIN PAGE

```
┌──────────────────────────────────────┐
│                                      │
│         🎓 SCHOOL SYSTEM             │
│                                      │
│      Parent Portal Login             │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Email:                         │  │
│  │ [___________________________]   │  │
│  │                                │  │
│  │ Password:                      │  │
│  │ [___________________________]   │  │
│  │                                │  │
│  │ ☐ Remember me                 │  │
│  │                                │  │
│  │ ┌──────────────────────────┐  │  │
│  │ │    [LOGIN]               │  │  │
│  │ └──────────────────────────┘  │  │
│  │                                │  │
│  │ Forgot password? Click here    │  │
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘

Colors:
- Primary: #007BFF (Blue)
- Text: #333
- Input Border: #CCC
- Button Hover: #0056b3
```

---

## 🏠 Page 2: PARENT DASHBOARD

```
┌────────────────────────────────────────────────────────┐
│ ☰ Parent Portal    Welcome, Raj 👋        [🔔] [👤]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📊 QUICK STATS                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ Connected    │ │ Attendance   │ │ Total Due    │  │
│  │ Children: 2  │ │ Average: 85% │ │ Fees: ₹15k   │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                        │
│  👨‍👩‍👧 MY CHILDREN                                    │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                 │  │
│  │  ┌──────────────────┐   ┌──────────────────┐   │  │
│  │  │ Raj Kumar ✓      │   │ Priya Sharma ✓   │   │  │
│  │  │ STU001           │   │ STU002           │   │  │
│  │  │ Class: 10-A      │   │ Class: 9-B       │   │  │
│  │  │ Attendance: 85%  │   │ Attendance: 92%  │   │  │
│  │  │ [View Details→]  │   │ [View Details→]  │   │  │
│  │  └──────────────────┘   └──────────────────┘   │  │
│  │                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  📢 RECENT ANNOUNCEMENTS                               │
│  ├─ Mid-term Exam Schedule Published                  │
│  ├─ Summer Holidays: May 15-30                        │
│  └─ Parent-Teacher Meeting: Next Friday              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 👨‍👩‍👧 Page 3: MY CHILDREN (Grid View)

```
┌────────────────────────────────────────────────────────┐
│ ☰ Parent Portal    My Children (2)        [🔔] [👤]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [All Children]                                        │
│                                                        │
│  ┌──────────────────┐   ┌──────────────────┐         │
│  │ Raj Kumar        │   │ Priya Sharma     │         │
│  │ ─────────────    │   │ ─────────────    │         │
│  │ Roll: STU001     │   │ Roll: STU002     │         │
│  │ Class: 10-A      │   │ Class: 9-B       │         │
│  │ Section: A       │   │ Section: B       │         │
│  │                  │   │                  │         │
│  │ Attendance: 85%  │   │ Attendance: 92%  │         │
│  │ Due Fees: ₹5k    │   │ Due Fees: ₹10k   │         │
│  │                  │   │                  │         │
│  │ [View Details→]  │   │ [View Details→]  │         │
│  │                  │   │                  │         │
│  └──────────────────┘   └──────────────────┘         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📊 Page 4: CHILD DETAIL - ATTENDANCE TAB (Default)

```
┌────────────────────────────────────────────────────────┐
│ ☰ Parent Portal    Raj Kumar (10-A)       [🔔] [👤]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ [Attendance] [Fees] [Results] [Announcements] [Time ▼] │
│                                                        │
│  📅 ATTENDANCE SUMMARY - APRIL 2026                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 📍 Total  │ │ ✓ Present│ │ ✗ Absent │ │ ⏰ Late  │ │
│  │    30    │ │    25    │ │    3     │ │    2    │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                        │
│  ┌──────────┐                                         │
│  │ 📊 83%   │  Attendance Percentage (Month)          │
│  └──────────┘                                         │
│                        ███████████░░░░                │
│                        83% (25/30 days)               │
│                                                        │
│  📈 ATTENDANCE CHART                                   │
│  ┌──────────────────────────────────────────────────┐ │
│  │                        ╱╲                        │ │
│  │                       ╱  ╲ ╱╲                    │ │
│  │                      ╱    ╲╱  ╲                  │ │
│  │                     ╱          ╲                 │ │
│  │  100% ─────────────             ─────           │ │
│  │                                                  │ │
│  │    0% ────────────────────────────────────      │ │
│  │       W1  W2  W3  W4  May                       │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  📝 RECENT ATTENDANCE RECORDS                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Date            │ Status        │ Remarks        │ │
│  ├─────────────────┼───────────────┼────────────────┤ │
│  │ 7 Apr (Sunday)  │ ✓ Present    │ -              │ │
│  │ 6 Apr (Sat)     │ ⏰ Late       │ 30 mins        │ │
│  │ 5 Apr (Friday)  │ ✓ Present    │ -              │ │
│  │ 4 Apr (Thursday)│ ✗ Absent     │ Medical leave  │ │
│  │ 3 Apr (Wed)     │ ✓ Present    │ -              │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [← Previous Month] [Next Month →]                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 💰 Page 5: CHILD DETAIL - FEES TAB

```
┌────────────────────────────────────────────────────────┐
│ ☰ Parent Portal    Raj Kumar (10-A)       [🔔] [👤]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ [Attendance] [Fees] [Results] [Announcements] [Time ▼] │
│                                                        │
│  💵 FEE SUMMARY                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ Total Fee    │ │ Paid         │ │ Balance      │  │
│  │ ₹50,000      │ │ ₹30,000      │ │ ₹20,000      │  │
│  └──────────────┘ └──────────────┘ └──────────────┘  │
│                                                        │
│  📊 PAYMENT PROGRESS                                   │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Payment Status (2025-26)                         │ │
│  │ ███████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│  │ ₹30,000 / ₹50,000 (60% Paid)                    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ⚠️  OUTSTANDING AMOUNT                                │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ₹20,000 Due                                      │ │
│  │                                                  │ │
│  │ Please submit payment by: 30 April 2026         │ │
│  │                                                  │ │
│  │ Payment Methods:                                │ │
│  │ • Check/DD                                      │ │
│  │ • Online Transfer                               │ │
│  │ • Card Payment                                  │ │
│  │                                                  │ │
│  │ Contact: account@school.edu | 1800-XXXX-XXXX   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  📜 PAYMENT HISTORY                                    │
│  │ Date       │ Period      │ Amount    │ Status    │ │
│  ├────────────┼─────────────┼───────────┼───────────┤ │
│  │ 15-Jan-26  │ Q1 (Apr-Jun)│ ₹25,000   │ ✓ Paid   │ │
│  │ 25-Feb-26  │ Q2 (Jul-Sep)│ ₹5,000    │ ✓ Paid   │ │
│  │ 1-Apr-26   │ Q3 (Oct-Dec)│ ₹20,000   │ 📍 Pending│ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📚 Page 6: CHILD DETAIL - RESULTS TAB

```
┌────────────────────────────────────────────────────────┐
│ ☰ Parent Portal    Raj Kumar (10-A)       [🔔] [👤]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ [Attendance] [Fees] [Results] [Announcements] [Time ▼] │
│                                                        │
│  🏆 EXAM RESULTS - 2025-26                             │
│                                                        │
│  FIL: Mid-term Exam                                    │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Subject         │ Marks   │ Grade │ Percentage   │ │
│  ├─────────────────┼─────────┼───────┼──────────────┤ │
│  │ English         │ 78/100  │ A     │ 78%         │ │
│  │ Mathematics     │ 85/100  │ A+    │ 85%         │ │
│  │ Science         │ 92/100  │ A+    │ 92%         │ │
│  │ Social Science  │ 88/100  │ A+    │ 88%         │ │
│  │ Hindi           │ 81/100  │ A     │ 81%         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  📊 OVERALL PERFORMANCE                                │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Total Marks: 424 / 500                           │ │
│  │ Percentage: 84.8%                                │ │
│  │ Grade: A+                                        │ │
│  │ Rank: 5th in Class                               │ │
│  │ Status: PASSED ✓                                 │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  📈 SUBJECT PERFORMANCE                                │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Science      ███████████████████░░░  92%        │ │
│  │ Mathematics  █████████████████░░░░░░  85%        │ │
│  │ Social Sci   ██████████████████░░░░░░  88%       │ │
│  │ Hindi        ████████████████░░░░░░░░  81%       │ │
│  │ English      ██████████████░░░░░░░░░░░░░ 78%     │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [← Previous Exam] [Next Exam →]                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📢 Page 7: CHILD DETAIL - ANNOUNCEMENTS TAB

```
┌────────────────────────────────────────────────────────┐
│ ☰ Parent Portal    Raj Kumar (10-A)       [🔔] [👤]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ [Attendance] [Fees] [Results] [Announcements] [Time ▼] │
│                                                        │
│  📢 CLASS ANNOUNCEMENTS                                │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 📌 PTA Meeting - Class 10-A                      │ │
│  │ ─────────────────────────────────────────────── │ │
│  │ Published: 7 Apr 2026                            │ │
│  │                                                  │ │
│  │ Dear Parents,                                   │ │
│  │                                                  │ │
│  │ We are organizing a PTA meeting on Saturday,    │ │
│  │ 15 April 2026 at 3:00 PM. Please bring your    │ │
│  │ child's latest report card.                     │ │
│  │                                                  │ │
│  │ Venue: School Auditorium                        │ │
│  │ Time: 3:00 PM - 5:00 PM                         │ │
│  │                                                  │ │
│  │ 📎 Attachments:                                  │ │
│  │    • Meeting_Agenda.pdf                         │ │
│  │    • Committee_List.pdf                         │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 📌 Mid-Term Exam Schedule                        │ │
│  │ ─────────────────────────────────────────────── │ │
│  │ Published: 5 Apr 2026                            │ │
│  │                                                  │ │
│  │ Dear Students,                                 │ │
│  │                                                  │ │
│  │ The Mid-term Examination for Class 10 will     │ │
│  │ commence from 15 April 2026. Below is the      │ │
│  │ detailed schedule...                            │ │
│  │                                                  │ │
│  │ 📎 Attachments:                                  │ │
│  │    • Exam_Schedule_10.pdf                       │ │
│  │    • Rules_Regulations.pdf                      │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 📌 Holiday Notification                          │ │
│  │ ─────────────────────────────────────────────── │ │
│  │ Published: 1 Apr 2026                            │ │
│  │                                                  │ │
│  │ Summer holidays will commence from 15 May 2026 │ │
│  │ and will end on 30 June 2026. School will      │ │
│  │ reopen on 1 July 2026.                         │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📅 Page 8: CHILD DETAIL - TIMETABLE TAB

```
┌────────────────────────────────────────────────────────┐
│ ☰ Parent Portal    Raj Kumar (10-A)       [🔔] [👤]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ [Attendance] [Fees] [Results] [Announcements] [Time ▼] │
│                                                        │
│  📚 CLASS TIMETABLE - CLASS 10-A                       │
│                                                        │
│  MONDAY                 TUESDAY                        │
│  ┌──────────────────┐   ┌──────────────────┐         │
│  │ 8:30 - 9:15      │   │ 8:30 - 9:15      │         │
│  │ English          │   │ Mathematics      │         │
│  │ Mrs. Sharma      │   │ Mr. Patel        │         │
│  └──────────────────┘   └──────────────────┘         │
│                                                        │
│  ┌──────────────────┐   ┌──────────────────┐         │
│  │ 9:15 - 10:00     │   │ 9:15 - 10:00     │         │
│  │ Mathematics      │   │ Science          │         │
│  │ Mr. Patel        │   │ Dr. Khan         │         │
│  └──────────────────┘   └──────────────────┘         │
│  ... (more periods)   ... (more periods)             │
│                                                        │
│  WEDNESDAY              THURSDAY                      │
│  ┌──────────────────┐   ┌──────────────────┐         │
│  │ 8:30 - 9:15      │   │ 8:30 - 9:15      │         │
│  │ Science          │   │ Social Science   │         │
│  │ Dr. Khan         │   │ Mr. Desai        │         │
│  └──────────────────┘   └──────────────────┘         │
│  ... (more periods)   ... (more periods)             │
│                                                        │
│  FRIDAY                 SATURDAY                      │
│  ┌──────────────────┐   ┌──────────────────┐         │
│  │ 8:30 - 9:15      │   │ 8:30 - 9:15      │         │
│  │ Hindi            │   │ Yoga/Sports      │         │
│  │ Miss Verma       │   │ Coach Ravi       │         │
│  └──────────────────┘   └──────────────────┘         │
│  ... (more periods)   ... (more periods)             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🎨 COLOR SCHEME & TYPOGRAPHY

### Primary Colors
```css
Primary Blue:      #007BFF
Success Green:     #28A745
Warning Orange:    #FFC107
Danger Red:        #DC3545
Info Cyan:         #17A2B8
Light Gray:        #F8F9FA
Dark Gray:         #343A40
Border Gray:       #DEE2E6
```

### Typography
```css
Headings:     Roboto Bold (700)
Subheadings:  Roboto Medium (600)
Body Text:    Roboto Regular (400)
Small Text:   Roboto Regular (400) - 12px

Font Sizes:
- H1 (Page Title): 28px
- H2 (Section Title): 22px
- H3 (Card Title): 18px
- Body: 14px-16px
- Small: 12px
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Mobile */
@media (max-width: 480px) {
  - Single column layout
  - Full-width cards
  - Hamburger menu for navigation
  - Stacked tabs vertically
}

/* Tablet */
@media (max-width: 768px) {
  - 2 column grid for children cards
  - Side-by-side stats cards
  - Horizontal scroll for tabs
}

/* Desktop */
@media (min-width: 769px) {
  - Full layout as shown above
  - 3-4 column grids
  - All features visible
}
```

---

## 🔘 BUTTON STYLES

### Primary Button (Actions)
```
Color: #007BFF
Hover: #0056b3
Active: #004085
Padding: 10px 20px
Radius: 4px
Font-weight: 600
```

### Secondary Button (Second Action)
```
Color: #6C757D
Hover: #5A6268
Active: #4E555B
Padding: 10px 20px
Radius: 4px
```

---

## 🏗️ LAYOUT GRID

```css
/* Main Container */
max-width: 1200px
padding: 20px
margin: 0 auto

/* Cards */
padding: 20px
border-radius: 8px
box-shadow: 0 2px 4px rgba(0,0,0,0.1)
margin-bottom: 20px

/* Grid for Children */
display: grid
grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
gap: 20px
```

---

## ⚡ INTERACTIVE ELEMENTS

### Hover Effects
```css
Cards:
- Background lightens slightly
- Shadow increases
- Cursor becomes pointer

Buttons:
- Color darkens
- Shadow slightly increases

Links:
- Color changes to primary blue
- Text decoration appears on hover
```

### Loading States
```
- Gray-out the section
- Show spinner animation
- Display "Loading..." text
- Disable all interactive elements
```

### Error States
```
- Red border on error input
- Red error message below
- Bell icon notification
- Toast/Alert message at top
```

---

## 🎯 IMPORTANT DESIGN NOTES

✅ **DO:**
1. Use consistent spacing (multiples of 4px or 8px)
2. Show loading spinners during API calls
3. Display error messages clearly
4. Make buttons obvious and clickable
5. Use icon + text for clarity
6. Ensure mobile responsiveness

❌ **DON'T:**
1. Use too many colors (stick to color scheme)
2. Make clickable elements look disabled
3. Show raw error messages to users
4. Use very small text on mobile
5. Use animations that are too slow
6. Forget loading states

---

## 📐 SPACING GUIDE

```
Element Spacing:
- Padding inside cards: 20px
- Margin between cards: 20px
- Margin between sections: 40px
- Padding around page: 20px

Typography Spacing:
- Between heading and text: 12px
- Between paragraphs: 16px
- Line height: 1.5 for body text
```

---

## 🌙 DARK MODE (Optional)

If implementing dark mode:
```css
Background: #121212
Surface: #1E1E1E
Primary Text: #FFFFFF
Secondary Text: #B0BEC5
Cards: #1E1E1E with 1px border #2C2C2C
```

---

**Design Status:**  ✅ Finalized  
**Responsive:** ✅ Mobile, Tablet, Desktop  
**Accessibility:** ✅ WCAG 2.1 AA compliant  
**Color Contrast:** ✅ Min 4.5:1 ratio

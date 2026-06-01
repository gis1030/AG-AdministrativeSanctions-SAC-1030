# 📊 Statistical study of administrative sanctions recorded in 2024 in the municipality of Schaerbeek
---

## 🔗 Quick Access

| Tool | Description | Link |
|---|---|---|
| 🏠 **Home page** | Project portal | [gis1030.github.io/AG-AdministrativeSanctions-SAC-1030](https://gis1030.github.io/AG-AdministrativeSanctions-SAC-1030/) |
| ⚖️ **Infractions Dashboard** | Infraction analysis — filters, trends, recovery | [SAC2024\_Charts1030\_Infractions.html](https://gis1030.github.io/AG-AdministrativeSanctions-SAC-1030/SAC2024_Charts1030_Infractions.html) |
| 👤 **Offenders Dashboard** | Offender profiles — residence, age, recidivism | [SAC2024\_Charts1030\_Contrevenant.html](https://gis1030.github.io/AG-AdministrativeSanctions-SAC-1030/SAC2024_Charts1030_Contrevenant.html) |

---

## 📋 About the Project

This statistical study analyses the recording and application of **Municipal Administrative Sanctions (SAC)** in the municipality of Schaerbeek during the year 2024.

Designed as a tool to relieve pressure on the criminal justice system and provide an immediate response to behaviours that harm civic coexistence, the SAC framework enables a quantitative assessment of **civility, cleanliness, and mobility** dynamics across the territory, managed jointly with the **Brussels North Police Zone**.

---

## 📈 Key Figures — 2024

| Indicator | Value |
|---|---|
| 📋 Total infractions recorded | **13,734** |
| 👤 Unique offenders | **9,304** |
| 💶 Total amount billed | **€1,060,961** |
| ✅ Amount collected | **€839,051** |
| 📊 Collection rate | **79.1%** |
| 🏘️ Neighbourhoods covered | **14 neighbourhoods** |
| 📅 Period | January – December 2024 |

---

## 🧭 Dashboard Contents

### ⚖️ Infractions Dashboard

Detailed analysis of the 13,734 recorded infractions, with the following filters:

**Available filters**
- Period (start / end month)
- Category (Parking · Classic SAC · Mixed SAC)
- Decision (Fine · Warning · No further action · No fine)
- Neighbourhood (14 Schaerbeek neighbourhoods)
- Case manager
- Document type (Initial PV · Report)
- Maximum amount (€0 – €500)

**Available visualisations**
- Monthly trends by category
- Monthly trends — infractions & recovery
- Breakdown by category, decision, and source
- Infractions by category — stacked areas (absolute / percentage)
- Infractions and recovery by neighbourhood
- Top 15 streets by infractions / recovery / outstanding amount
- Heatmap of infractions by month × day of week
- Scatter plot — amount billed vs collected
- Top 12 regulatory articles breached
- Dynamic Top N table (street · neighbourhood · case manager)
- Administrative processing times: recording · decision · payment
- Average decision time by neighbourhood
- Decision delay distribution
- Prescription risk by neighbourhood and category
- PNG export per chart · Filtered CSV export

---

### 👤 Offenders Dashboard

Analytical profile of the 9,304 unique offenders, with the following filters:

**Available filters**
- Offender type (natural person / legal entity)
- Gender / Type (Male · Female · Company)
- Country of origin (all · Belgium · foreign)
- Municipality of residence
- Schaerbeek neighbourhood of residence
- Age range (15 – 94 years)
- Amount paid (€0 – €14,222)

**Available visualisations**
- PV vs Report by offender type
- Infraction type by municipality of residence
- Residence breakdown: Schaerbeek · Belgium · Foreign
- Total amount by municipality of residence
- Offender type (natural vs legal entity)
- Infraction category by municipality of residence
- Distribution of amounts paid by tariff bracket
- Gender/type breakdown (M · F · Company)
- Age distribution (5-year brackets)
- Top municipalities by cumulated infractions
- Top N offenders ranked by amount paid
- Cumulated infractions by Schaerbeek neighbourhood of residence
- Payment rate by neighbourhood
- Recidivism profile by neighbourhood
- PNG export per chart · Filtered CSV export

---

## 🛠️ Technologies

- **HTML / CSS / JavaScript** — 100% client-side application, no server required
- **Chart.js / D3.js** — interactive statistical visualisations
- **GitHub Pages** — static hosting

---

## 🌐 Compatibility

Compatible with recent versions of **Firefox**, **Chrome**, and **Edge**.  
Optimised for desktop use; some visualisations may require a wide screen.

---

## 📁 Repository Structure

```
AG-AdministrativeSanctions-SAC-1030/
├── index.html                              # Home page
├── SAC2024_Charts1030_Infractions.html     # Infractions Dashboard
├── SAC2024_Charts1030_Contrevenant.html    # Offenders Dashboard
├── css/                                    # Styles and images
├── images/                                 # Graphic assets
└── data/                                   # Data files (if applicable)
```

---

## 📅 Changelog

| Date | Description |
|---|---|
| April 2026 | Project published |
| December 2024 | SAC data frozen as of 31/12/2024 |

---

## 📄 Data and Legal Context

The data analysed corresponds to **municipal administrative sanctions recorded** by the municipality of Schaerbeek during 2024, within the framework of Belgian legislation on SAC (Law of 24 June 2013 on municipal administrative sanctions and its subsequent amendments).

This project is produced for **internal statistical analysis** and **administrative transparency** purposes. All published data consists of **anonymised aggregates**; no data enabling the identification of an individual offender is published.

---

## 🔒 Data Protection (GDPR)

The visualisations published in this project are based exclusively on **aggregated and anonymised statistical data**. No name, address, national registration number, or data enabling direct identification of a natural person is published.

The data processed internally to produce these statistics falls under the following legal basis:
- **Article 6.1(e) of the GDPR** — processing necessary for the performance of a task carried out in the public interest
- **Law of 24 June 2013** on municipal administrative sanctions (and its subsequent amendments)

### Data Controller

**Commune de Schaerbeek** · Place Colignon · 1030 Brussels · Belgium

---

*Commune de Schaerbeek · 1030 Brussels · Belgium*


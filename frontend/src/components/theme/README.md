# ThemeToggle Component

Komponen toggle theme yang modern dan profesional dengan 5 variant berbeda.

## Features

✨ **5 Variant Berbeda** - Pilih sesuai kebutuhan desain
🎨 **Smooth Animations** - Transisi yang halus dan profesional
♿ **Accessible** - Dengan aria-label dan keyboard support
📱 **Responsive** - Bekerja sempurna di semua ukuran layar
🎯 **Customizable** - Ukuran icon bisa disesuaikan

## Usage

```jsx
import ThemeToggle from './components/theme/ThemeToggle';

// Default variant (dengan text)
<ThemeToggle variant="default" />

// Icon only
<ThemeToggle variant="icon" />

// Switch style
<ThemeToggle variant="switch" />

// Minimal style
<ThemeToggle variant="minimal" />

// Gradient style (recommended)
<ThemeToggle variant="gradient" />

// Custom size
<ThemeToggle variant="icon" size={24} />
```

## Variants

### 1. Default
Toggle dengan text label, cocok untuk header atau navbar.
- Menampilkan icon + text "Light"/"Dark"
- Text tersembunyi di mobile (sm breakpoint)
- Animasi hover dengan shimmer effect

### 2. Icon Only
Hanya menampilkan icon, hemat space.
- Cocok untuk mobile view atau sidebar compact
- Ukuran fixed 40x40px
- Hover effect dengan scale

### 3. Switch
Toggle switch modern seperti iOS/Android.
- Cocok untuk settings page
- Animasi slide yang smooth
- Visual feedback yang jelas

### 4. Minimal
Desain minimal dengan background color yang berubah.
- Background berubah sesuai theme
- Cocok untuk floating button
- Hover effect dengan rotation

### 5. Gradient ⭐ (Recommended)
Paling modern dengan gradient background.
- Eye-catching dan premium look
- Gradient berubah sesuai theme
- Cocok untuk landing page atau hero section

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'icon' \| 'switch' \| 'minimal' \| 'gradient'` | `'default'` | Variant style toggle |
| `size` | `number` | `18` | Ukuran icon dalam pixel |

## Animation Details

Semua variant menggunakan animasi yang smooth:
- **Icon rotation**: 500ms dengan ease timing
- **Scale transform**: 300ms untuk hover effect
- **Color transition**: 300-500ms untuk perubahan warna
- **Shimmer effect**: 700ms untuk hover shimmer

## Accessibility

- ✅ Keyboard accessible (Tab + Enter/Space)
- ✅ Screen reader friendly dengan aria-label
- ✅ Focus visible dengan ring indicator
- ✅ Title attribute untuk tooltip

## Examples

### Header Navigation
```jsx
<header>
  <nav>
    <Logo />
    <ThemeToggle variant="gradient" />
    <LoginButton />
  </nav>
</header>
```

### Admin Dashboard
```jsx
<AdminHeader>
  <UserInfo />
  <ThemeToggle variant="switch" size={16} />
  <LogoutButton />
</AdminHeader>
```

### Settings Page
```jsx
<SettingsSection>
  <label>Theme Preference</label>
  <ThemeToggle variant="switch" />
</SettingsSection>
```

### Mobile Sidebar
```jsx
<MobileSidebar>
  <MenuItems />
  <ThemeToggle variant="icon" size={20} />
</MobileSidebar>
```

## Testing Showcase

Untuk melihat semua variant sekaligus, gunakan komponen showcase:

```jsx
import ThemeToggleShowcase from './components/theme/ThemeToggleShowcase';

// Di route testing
<Route path="/theme-showcase" element={<ThemeToggleShowcase />} />
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Performance

- Menggunakan CSS transitions (hardware accelerated)
- Tidak ada re-render berlebihan
- Optimized dengan React.memo jika diperlukan

## Tips

1. **Untuk landing page**: Gunakan `variant="gradient"` untuk tampilan premium
2. **Untuk admin dashboard**: Gunakan `variant="switch"` atau `variant="icon"`
3. **Untuk mobile**: Gunakan `variant="icon"` untuk hemat space
4. **Untuk settings**: Gunakan `variant="switch"` untuk UX yang familiar

## License

MIT

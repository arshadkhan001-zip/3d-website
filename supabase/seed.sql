-- Cover King Panipat — seed (Phase 5)
-- Transfers the existing hardcoded catalog into Supabase. Safe to re-run
-- (upserts on slug / code). Images use `gradient:<from>:<to>` placeholders
-- that the storefront renders as CSS visuals until real photography exists.

-- ── products (id, name, slug, description, price, compare, category, series,
--    material, tags, brands, badge, phone_models, rating, reviews) ──
insert into public.products
  (name, slug, description, price, compare_at_price, category, series, material, tags, brands, badge, phone_models, rating, reviews_count, featured)
values
  ('FORM Clear','form-clear','Crystal-clear shell that shows the phone as designed.',799,null,'Clear','Crystal Series','Crystal','{transparent,minimal}','{iphone,samsung,oneplus}',null,'{iphone-16,galaxy-s26,oneplus-13}',4.8,214,true),
  ('FORM Black','form-black','Matte black everyday cover with a quiet grip.',899,null,'Everyday','Essential Series','Silicone','{protective,minimal}','{iphone,samsung}',null,'{iphone-16,iphone-17,galaxy-s26}',4.7,86,true),
  ('FORM Frost','form-frost','Soft-touch frosted finish that resists fingerprints.',999,null,'Matte','Matte Series','Matte','{minimal}','{iphone,samsung,oneplus}',null,'{iphone-16,galaxy-s26,oneplus-13}',4.7,86,false),
  ('FORM Carbon','form-carbon','Layered armor build for drops, bumps and daily knocks.',1099,null,'Armor','Armor Series','Armor','{protective}','{iphone,samsung}',null,'{iphone-16-pro,galaxy-s26-ultra}',4.9,167,true),
  ('FORM Stone','form-stone','A calm stone texture with a slim, pocketable profile.',999,null,'Minimal','Minimal Series','Silicone','{minimal}','{iphone,oneplus}',null,'{iphone-16,oneplus-13}',4.7,86,false),
  ('FORM Blue','form-blue','Deep studio blue with a smooth satin feel.',899,null,'Studio','Studio Series','Matte','{minimal}','{iphone,samsung,oneplus}',null,'{iphone-17,galaxy-s26,oneplus-13r}',4.7,86,false),
  ('FORM Edge','form-edge','A raised perimeter that takes the hit before your screen does.',1099,null,'Protective','Edge Protection Series','Armor','{protective}','{iphone,samsung,oneplus}','New','{iphone-17-pro,galaxy-s26,oneplus-13}',4.7,86,true),
  ('FORM Armor','form-armor','Dual-layer impact build for serious drops and rough days.',1199,null,'Protective','Impact Series','Armor','{protective}','{iphone,samsung}',null,'{iphone-16-pro,galaxy-s26-ultra}',4.7,86,false),
  ('FORM Matte','form-matte','Velvety soft-touch coating with a clean matte look.',999,null,'Matte','Soft Touch Series','Silicone','{minimal}','{samsung,oneplus}',null,'{galaxy-s26,oneplus-13}',4.7,86,false),
  ('FORM Ghost','form-ghost','Barely-there transparency with anti-yellow coating.',899,null,'Clear','Transparent Series','Crystal','{transparent,minimal}','{iphone,oneplus}',null,'{iphone-17,oneplus-13r}',4.7,86,false),
  ('FORM Shield','form-shield','Maximum-coverage defender with reinforced corners.',1299,null,'Protective','Defender Series','Armor','{protective}','{iphone,samsung}',null,'{iphone-17-pro,galaxy-s26-ultra}',4.7,86,false),
  ('FORM Air','form-air','Featherweight protection you forget you are carrying.',999,null,'Minimal','Ultralight Series','Crystal','{minimal,transparent}','{iphone,samsung,oneplus}',null,'{iphone-16,galaxy-s26,oneplus-13}',4.7,86,false),
  ('FORM Tempered','form-tempered','9H tempered glass with alignment-frame install.',499,699,'Screen','Shield Glass Series','Glass','{minimal}','{iphone,samsung,oneplus,pixel,xiaomi}',null,'{}',4.7,86,true),
  ('FORM Privacy','form-privacy','Two-way privacy filter with smudge resistance.',799,null,'Screen','Shield Glass Series','Glass','{minimal}','{iphone,samsung,oneplus,pixel,xiaomi}',null,'{}',4.7,86,false),
  ('FORM Lens Guard','form-lens','Sapphire-coated lens rings, case-friendly fit.',399,null,'Camera','Camera Series','Aluminum','{minimal}','{iphone,samsung,oneplus,pixel,xiaomi}',null,'{}',4.7,86,false),
  ('FORM MagCharge','form-magcharge','15W magnetic wireless charger with braided cable.',1999,null,'Charging','MagSafe Series','Aluminum','{minimal}','{iphone,samsung,oneplus,pixel,xiaomi}','New','{}',4.7,86,true),
  ('FORM Volt Cable','form-volt','60W braided USB-C cable, 1.5m, strain-relief ends.',499,null,'Cables','Cable Series','Nylon','{minimal}','{iphone,samsung,oneplus,pixel,xiaomi}',null,'{}',4.7,86,false),
  ('FORM Volt Pro','form-volt-pro','120W fast-charge cable with LED power readout.',799,null,'Cables','Cable Series','Nylon','{minimal}','{iphone,samsung,oneplus,pixel,xiaomi}',null,'{}',4.7,86,false),
  ('FORM Power 10K','form-power-10k','10,000mAh bank with 22.5W two-way fast charging.',2499,2999,'Power','Power Series','Polycarbonate','{minimal}','{iphone,samsung,oneplus,pixel,xiaomi}','Bestseller','{}',4.8,150,true),
  ('FORM Power Mini','form-power-mini','5,000mAh pocket bank with built-in USB-C plug.',1799,null,'Power','Power Series','Polycarbonate','{minimal}','{iphone,samsung,oneplus,pixel,xiaomi}',null,'{}',4.7,86,false),
  ('FORM Grip','form-grip','MagSafe phone grip with flip-out stand.',399,null,'Grip','Grip Series','Silicone','{minimal}','{iphone,samsung,oneplus,pixel,xiaomi}','New','{}',4.7,86,false),
  ('FORM Stand','form-stand','Weighted aluminum desk stand, portrait + landscape.',899,null,'Stands','Desk Series','Aluminum','{minimal}','{iphone,samsung,oneplus,pixel,xiaomi}',null,'{}',4.7,86,false),
  ('FORM MagWallet','form-magwallet','Vegan-leather magnetic wallet for 3 cards.',1299,null,'MagSafe','MagSafe Series','Vegan leather','{minimal}','{iphone,samsung,oneplus,pixel,xiaomi}',null,'{}',4.7,86,false),
  ('FORM Car Dock','form-car-dock','Magnetic car mount with 15W charging, vent + dash.',1499,null,'Car','Drive Series','Aluminum','{minimal}','{iphone,samsung,oneplus,pixel,xiaomi}',null,'{}',4.7,86,false)
on conflict (slug) do update set
  name = excluded.name, description = excluded.description, price = excluded.price,
  compare_at_price = excluded.compare_at_price, category = excluded.category,
  series = excluded.series, material = excluded.material, tags = excluded.tags,
  brands = excluded.brands, badge = excluded.badge, phone_models = excluded.phone_models,
  rating = excluded.rating, reviews_count = excluded.reviews_count,
  featured = excluded.featured, updated_at = now();

-- ── variants (slug, name, color hex, stock, limited models) ──
-- Cleared + re-seeded so the catalog stays in sync on re-run.
delete from public.product_variants
  where product_id in (select id from public.products);

insert into public.product_variants (product_id, name, phone_model, color, stock, variant_models)
select p.id, v.name, '', v.color, v.stock, v.models from public.products p join (values
  ('form-clear','Clear','#B9C6D8',20,null),('form-clear','Smoke','#3A4356',14,null),
  ('form-black','Black','#15181F',25,null),('form-black','Graphite','#2E3440',18,null),
  ('form-frost','Frost','#D8D5CE',22,null),('form-frost','Mist','#9AA3B2',16,null),
  ('form-carbon','Carbon','#23262B',3,null),('form-carbon','Ember','#E0762E',2,'{iphone-16-pro}'),
  ('form-stone','Stone','#C9C2B4',19,null),('form-stone','Clay','#8A7B6C',12,null),
  ('form-blue','Blue','#2E4A6B',21,null),('form-blue','Ink','#10141C',15,null),
  ('form-edge','Slate','#4A5261',17,null),('form-edge','Black','#15181F',13,null),
  ('form-armor','Graphite','#2E3440',4,null),('form-armor','Black','#0B0D12',2,null),
  ('form-matte','Fog','#6B7280',23,null),('form-matte','Ink','#23262B',17,null),
  ('form-ghost','Ghost','#DDE5F0',26,null),('form-ghost','Frost','#9AA3B2',18,null),
  ('form-shield','Midnight','#1F2530',6,'{galaxy-s26-ultra}'),('form-shield','Black','#090B0F',9,null),
  ('form-air','Air','#C7D2E2',24,null),('form-air','Smoke','#55637A',16,null),
  ('form-tempered','Clear','#DDE5F0',40,null),('form-tempered','Privacy','#23262B',30,null),
  ('form-privacy','Privacy','#23262B',22,null),
  ('form-lens','Silver','#B9C6D8',35,null),('form-lens','Black','#15181F',28,null),
  ('form-magcharge','Silver','#C9D5E6',18,null),('form-magcharge','Graphite','#2E3440',12,null),
  ('form-volt','Bone','#ECE7DB',60,null),('form-volt','Black','#15181F',55,null),
  ('form-volt-pro','Black','#15181F',44,null),
  ('form-power-10k','Bone','#ECE7DB',15,null),('form-power-10k','Graphite','#2E3440',11,null),
  ('form-power-mini','Blue','#2E4A6B',27,null),
  ('form-grip','Ember','#E0762E',50,null),('form-grip','Black','#15181F',45,null),
  ('form-stand','Silver','#B9C6D8',31,null),
  ('form-magwallet','Tan','#C98A2E',4,null),('form-magwallet','Black','#15181F',16,null),
  ('form-car-dock','Black','#15181F',0,null)
) as v(slug, name, color, stock, models) on v.slug = p.slug;

-- ── images: gradient placeholders (parsed by the storefront) ──
delete from public.product_images
  where product_id in (select id from public.products) and image_url like 'gradient:%';

insert into public.product_images (product_id, image_url, sort_order)
select id, img, 0 from (values
  ('form-clear','gradient:#C9D5E6:#5E6E88'),('form-black','gradient:#232936:#0C0F16'),
  ('form-frost','gradient:#E3E0D8:#8E97A6'),('form-carbon','gradient:#3A3E46:#121316'),
  ('form-stone','gradient:#D3CDBF:#7E7466'),('form-blue','gradient:#3E5E85:#141C29'),
  ('form-edge','gradient:#4A5261:#141821'),('form-armor','gradient:#2E3440:#0B0D12'),
  ('form-matte','gradient:#6B7280:#23262B'),('form-ghost','gradient:#DDE5F0:#7E93B0'),
  ('form-shield','gradient:#1F2530:#090B0F'),('form-air','gradient:#C7D2E2:#55637A'),
  ('form-tempered','gradient:#C9D5E6:#6B7A90'),('form-privacy','gradient:#3A4356:#0C0F16'),
  ('form-lens','gradient:#9AA3B2:#3A4356'),('form-magcharge','gradient:#8E97A6:#232936'),
  ('form-volt','gradient:#D3CDBF:#4A5261'),('form-volt-pro','gradient:#2E3440:#0B0D12'),
  ('form-power-10k','gradient:#E3E0D8:#5E6E88'),('form-power-mini','gradient:#3E5E85:#141C29'),
  ('form-grip','gradient:#E0762E:#7E3A12'),('form-stand','gradient:#9AA3B2:#4A5261'),
  ('form-magwallet','gradient:#C98A2E:#5E3D14'),('form-car-dock','gradient:#2E3440:#090B0F')
) as v(slug, img) join public.products p on p.slug = v.slug;

-- ── coupons ──────────────────────────────────────────────────
insert into public.coupons (code, discount_type, discount_value, minimum_order, maximum_discount, usage_limit, active)
values
  ('FORM10','percentage',10,0,500,null,true),
  ('WELCOME15','percentage',15,1499,750,500,true)
on conflict (code) do update set
  discount_type = excluded.discount_type, discount_value = excluded.discount_value,
  minimum_order = excluded.minimum_order, maximum_discount = excluded.maximum_discount,
  active = excluded.active;

-- ── store settings ───────────────────────────────────────────
update public.store_settings set
  store_name = 'Cover King Panipat',
  store_email = 'vegetacoder69@gmail.com',
  currency = 'INR',
  shipping_fee = 79,
  free_shipping_threshold = 999,
  cod_enabled = true,
  online_payments_enabled = false,
  low_stock_threshold = 5
where id = 1;

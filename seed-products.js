require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CATEGORIES = [
    { key: 'devices', label: 'Electronics', products: [
        { name: 'Samsung Galaxy S24', price: 85000, desc: '128GB, 8GB RAM, 6.2 inch display' },
        { name: 'iPhone 15', price: 95000, desc: '128GB, A16 chip, 6.1 inch Super Retina' },
        { name: 'MacBook Air M2', price: 145000, desc: '13-inch, 256GB SSD, 8GB RAM' },
        { name: 'Dell XPS 15', price: 155000, desc: 'Intel i7, 512GB SSD, 16GB RAM, 15.6 inch' },
        { name: 'Sony WH-1000XM5', price: 28000, desc: 'Wireless noise-cancelling headphones' },
        { name: 'JBL Flip 6', price: 12000, desc: 'Portable Bluetooth speaker, 12hr battery' },
        { name: 'Samsung 43 inch Smart TV', price: 52000, desc: '4K UHD, Tizen OS, HDR10+' },
        { name: 'Logitech MX Keys', price: 7500, desc: 'Wireless illuminated keyboard' },
        { name: 'Logitech MX Master 3', price: 8500, desc: 'Wireless mouse, ergonomic design' },
        { name: 'iPad Air 5th Gen', price: 68000, desc: '256GB, M1 chip, 10.9 inch display' },
        { name: 'Xiaomi Redmi Note 13', price: 24000, desc: '256GB, 8GB RAM, 6.67 inch AMOLED' },
        { name: 'Realme Pad Mini', price: 18000, desc: '64GB, 4GB RAM, 8.7 inch display' },
        { name: 'Canon EOS R10', price: 115000, desc: '24.2MP, APS-C sensor, 4K video' },
        { name: 'Sony PlayStation 5', price: 65000, desc: '825GB SSD, Digital Edition' },
        { name: 'Xbox Series S', price: 38000, desc: '512GB, 1440p gaming' },
        { name: 'Nintendo Switch OLED', price: 35000, desc: '64GB, 7 inch OLED screen' },
        { name: 'Razer DeathAdder V3', price: 4500, desc: 'Gaming mouse, 25K DPI sensor' },
        { name: 'Corsair K70 Keyboard', price: 14000, desc: 'Mechanical RGB gaming keyboard' },
        { name: 'Western Digital 1TB SSD', price: 7500, desc: 'Portable external SSD, USB 3.2' },
        { name: 'Seagate 2TB HDD', price: 5500, desc: 'External hard drive, USB 3.0' },
        { name: 'TP-Link Archer AX6000', price: 18000, desc: 'Wi-Fi 6 router, 6000Mbps' },
        { name: 'Anker PowerCore 20000', price: 3500, desc: 'Portable power bank, 20,000mAh' },
        { name: 'Ring Video Doorbell', price: 12000, desc: '1080p HD, 2-way audio, night vision' },
        { name: 'Apple Watch Series 9', price: 52000, desc: '45mm, GPS + Cellular' },
        { name: 'Samsung Galaxy Watch 6', price: 28000, desc: '44mm, Bluetooth, fitness tracking' },
        { name: 'Garmin Forerunner 265', price: 48000, desc: 'GPS running watch, AMOLED display' },
        { name: 'GoPro Hero 12 Black', price: 45000, desc: '5.3K video, 27MP photos, waterproof' },
        { name: 'DJI Mini 3 Pro', price: 75000, desc: '4K camera drone, 34min flight time' },
        { name: 'Kindle Paperwhite', price: 15000, desc: '6.8 inch, 8GB, adjustable warm light' },
        { name: 'Bose SoundLink Flex', price: 14000, desc: 'Portable Bluetooth speaker, IP67 waterproof' }
    ]},
    { key: 'fashion', label: 'Fashion', products: [
        { name: 'Adidas Ultraboost 22', price: 13500, desc: 'Running shoes, Primeblue upper' },
        { name: 'Nike Air Max 90', price: 11500, desc: 'Classic sneakers, Air cushioning' },
        { name: 'Levis 501 Original Jeans', price: 4500, desc: 'Straight fit, 100% cotton denim' },
        { name: 'Zara Blazer', price: 6500, desc: 'Wool blend, slim fit, navy blue' },
        { name: 'H&M Floral Dress', price: 2500, desc: 'Midi length, V-neck, floral print' },
        { name: 'Balmain B-Hive Hoodie', price: 18000, desc: 'Oversized fit, cotton fleece, black' },
        { name: 'Ray-Ban Aviator Classic', price: 8500, desc: 'Metal frame, green G-15 lens' },
        { name: 'Daniel Klein Ladies Watch', price: 3800, desc: 'Rose gold, leather strap, quartz' },
        { name: 'Michael Kors Tote Bag', price: 12000, desc: 'Jet Set Medium, Saffiano leather' },
        { name: 'Vans Old Skool', price: 3800, desc: 'Canvas skate shoes, black/white' },
        { name: 'Converse Chuck Taylor All Star', price: 3200, desc: 'High top, 100% canvas, white' },
        { name: 'Timberland 6 inch Boot', price: 9500, desc: 'Premium waterbuck waterproof boots' },
        { name: 'Calvin Klein Underwear Set', price: 2200, desc: '3-pack boxer briefs, cotton blend' },
        { name: 'Victoria Secret Lounge Set', price: 5500, desc: 'Soft brushed microfiber, XS-XL' },
        { name: 'Hugo Boss Leather Belt', price: 4500, desc: 'Reversible, 35mm, polished buckle' },
        { name: 'Burberry Cashmere Scarf', price: 18000, desc: '100% cashmere, check pattern, camel' },
        { name: 'Gucci GG Marmont Bag', price: 25000, desc: 'Small shoulder bag, matelassé leather' },
        { name: 'Prada Nylon Backpack', price: 28000, desc: 'Re-edition 2005, padded straps' },
        { name: 'Louis Vuitton Belt', price: 32000, desc: 'Monogram canvas, 35mm, brass buckle' },
        { name: 'Dior Book Tote', price: 38000, desc: 'Medium, Oblique jacquard fabric' },
        { name: 'Nike Dri-FIT Running Tee', price: 2200, desc: 'Men, moisture-wicking, black' },
        { name: 'Under Armour Sports Bra', price: 1800, desc: 'High support, removable padding' },
        { name: 'Supreme Box Logo Tee', price: 8500, desc: 'Black, 100% cotton, crew neck' },
        { name: 'Stussy Basic Logo Tee', price: 3500, desc: 'Heavyweight cotton, stone grey' },
        { name: 'Carhartt WIP Pocket Tee', price: 2800, desc: 'Slim fit, jersey cotton, pocket detail' },
        { name: 'Polo Ralph Lauren Shirt', price: 5500, desc: 'Custom fit, interlock pique, navy' },
        { name: 'Lacoste Classic Polo', price: 3200, desc: 'Regular fit, petit piqué cotton' },
        { name: 'Ralph Lauren Wool Sweater', price: 7500, desc: 'Slim fit, merino wool, burgundy' },
        { name: 'Zara Leather Jacket', price: 8500, desc: 'Faux leather, biker style, black' },
        { name: 'Mango Linen Trousers', price: 3500, desc: 'High-waisted, wide leg, beige' }
    ]},
    { key: 'foodanddrinks', label: 'Food & Drinks', products: [
        { name: 'Kenyan AA Coffee 500g', price: 1800, desc: 'Single origin, medium roast, Arabica' },
        { name: 'Milima Honey 1kg', price: 1200, desc: 'Pure wildflower honey, raw unfiltered' },
        { name: 'Chai Masala Tea 250g', price: 450, desc: 'Blend of cardamom, ginger, cinnamon, clove' },
        { name: 'Kenyan Black Tea 500g', price: 350, desc: 'Kericho Gold, loose leaf, robust flavor' },
        { name: 'Red Wine Bottle - Tuscan Blend', price: 2800, desc: '750ml, 13.5% ABV, full-bodied' },
        { name: 'White Wine - South African Chenin', price: 1800, desc: '750ml, crisp, tropical fruit notes' },
        { name: 'Heineken 6-Pack', price: 2400, desc: '330ml bottles, 5% ABV, lager' },
        { name: 'Tusker Lager 6-Pack', price: 1100, desc: '500ml bottles, 5% ABV, Kenyan classic' },
        { name: 'Guinness Foreign Extra Stout', price: 800, desc: '500ml can, 7.5% ABV, rich dark stout' },
        { name: 'Coca-Cola 6-Pack', price: 850, desc: '330ml cans, classic original taste' },
        { name: 'Fresh Orange Juice 1L', price: 350, desc: '100% pure squeezed, no added sugar' },
        { name: 'Almond Milk 1L', price: 580, desc: 'Unsweetened, fortified with Vitamin D' },
        { name: 'Oat Milk 1L', price: 620, desc: 'Barista edition, gluten-free, creamy' },
        { name: 'Avocado Toast Mix 200g', price: 900, desc: 'Pre-mixed spice blend for avocado dishes' },
        { name: 'Sundried Tomatoes 300g', price: 750, desc: 'In olive oil, Mediterranean style' },
        { name: 'Organic Quinoa 500g', price: 1200, desc: 'Tri-color, pre-washed, high protein' },
        { name: 'Chia Seeds 300g', price: 850, desc: 'Organic, high in Omega-3, gluten-free' },
        { name: 'Dark Chocolate 85% Cacao', price: 650, desc: '100g bar, sugar-free, intense flavor' },
        { name: 'Mixed Nuts 400g', price: 950, desc: 'Cashews, almonds, walnuts, roasted' },
        { name: 'Dried Mango 200g', price: 480, desc: 'Unsulphured, no added sugar, chewy' },
        { name: 'Coconut Oil 500ml', price: 750, desc: 'Virgin cold-pressed, cooking & skincare' },
        { name: 'Olive Oil Extra Virgin 750ml', price: 1400, desc: 'Cold-pressed, Italian, fruity aroma' },
        { name: 'Instant Maisha Porridge 500g', price: 320, desc: 'Instant sorghum flour, fortified with iron' },
        { name: 'Peanut Butter 500g', price: 580, desc: 'Smooth, natural, no added sugar' },
        { name: 'Mango Jam 300g', price: 420, desc: 'Handmade, natural fruit, no preservatives' },
        { name: 'Smokies Sausages 500g', price: 650, desc: 'Pre-cooked, smoked, 10 links per pack' },
        { name: 'Yoghurt Plain 500ml', price: 380, desc: 'Full cream, probiotic, fresh dairy' },
        { name: 'Cheddar Cheese 400g', price: 750, desc: 'Aged 12 months, sharp flavor, block' },
        { name: 'Protein Energy Bars 6-Pack', price: 1400, desc: 'Oats, honey, peanuts, 25g protein each' },
        { name: 'Sparkling Water 12-Pack', price: 1200, desc: '500ml bottles, natural mineral water' }
    ]},
    { key: 'houseitems', label: 'House Items', products: [
        { name: 'Memory Foam Mattress 6x6ft', price: 28000, desc: 'High density, 8 inch, hypoallergenic' },
        { name: 'King Size Bedsheet Set', price: 3500, desc: 'Egyptian cotton, 400 thread count' },
        { name: 'Blackout Curtains 2-Panel', price: 2800, desc: '200x270cm, thermal insulated, grey' },
        { name: 'Standing Floor Lamp', price: 4500, desc: 'Adjustable height, modern design, LED' },
        { name: 'Table Lamp Set of 2', price: 2200, desc: 'Ceramic base, fabric shade, warm light' },
        { name: 'Scented Candle Set 6-Pack', price: 1500, desc: 'Vanilla, lavender, jasmine, 40hr burn each' },
        { name: 'Throw Pillows 4-Pack', price: 1800, desc: 'Velvet, assorted colors, 45x45cm' },
        { name: 'Wall Mirror 80cm Round', price: 3800, desc: 'Brushed gold frame, HD mirror glass' },
        { name: 'Area Rug 2x3m', price: 6500, desc: 'Persian style, polypropylene, stain-resistant' },
        { name: 'Bookshelf 5-Tier', price: 8500, desc: 'Industrial metal-wood, 180cm tall' },
        { name: 'Dining Table Set 6-Seater', price: 35000, desc: 'Solid wood top, cushioned chairs' },
        { name: 'Office Chair Ergonomic', price: 12000, desc: 'Mesh back, lumbar support, adjustable armrest' },
        { name: 'Coffee Table Set', price: 6500, desc: 'Tempered glass top, wooden legs, 2 side tables' },
        { name: 'Shoe Rack 4-Tier', price: 2800, desc: 'Bamboo, breathable, 8 pairs capacity' },
        { name: 'Clothes Wardrobe 2-Door', price: 15000, desc: 'Particle board, with mirror, ample storage' },
        { name: 'Kitchen Blender Pro', price: 4500, desc: '1.5L capacity, 1000W, stainless steel' },
        { name: 'Air Fryer XXL 5.5L', price: 8500, desc: 'Digital display, 8-in-1 functions, non-stick' },
        { name: 'Electric Pressure Cooker 6L', price: 6500, desc: 'Multi-cooker, 10 programs, stainless steel' },
        { name: 'Toaster 4-Slice', price: 2200, desc: 'Stainless steel, cancel/reheat/defrost' },
        { name: 'Electric Kettle 1.8L', price: 1800, desc: 'Fast boil, auto shut-off, concealed element' },
        { name: 'Microwave Oven 30L', price: 9500, desc: 'Solo, digital controls, 10 power levels' },
        { name: 'Vacuum Cleaner 2-in-1', price: 5500, desc: 'Cordless stick + handheld, HEPA filter' },
        { name: 'Steam Iron 2400W', price: 2200, desc: 'Ceramic soleplate, vertical steam, auto-off' },
        { name: 'Laundry Basket 65L', price: 850, desc: 'Collapsible, fabric with metal frame' },
        { name: 'Drying Rack 3-Tier', price: 1200, desc: 'Stainless steel, 20m line space' },
        { name: 'Kitchen Knife Set 8-Piece', price: 3500, desc: 'German stainless steel, wooden block' },
        { name: 'Dinner Set 24-Piece', price: 4500, desc: 'Porcelain, dishwasher safe, white with gold rim' },
        { name: 'Water Purifier Table Top', price: 5500, desc: 'Ceramic filter, 10L reservoir, portable' },
        { name: 'Bath Towel Set 6-Pack', price: 2800, desc: '100% cotton, highly absorbent, assorted' },
        { name: 'Storage Boxes 5-Pack', price: 1500, desc: 'Fabric with lid, foldable, various sizes' }
    ]},
    { key: 'rentals', label: 'Rentals', products: [
        { name: 'Event Marquee Tent 50 Seater', price: 25000, desc: 'White canopy, waterproof, includes tables' },
        { name: 'Generator 5KVA', price: 3500, desc: 'Petrol, silent type, ideal for events' },
        { name: 'Projector 4K Short Throw', price: 4000, desc: '200 inch max, HDMI, Wi-Fi enabled' },
        { name: 'Sound System Party Package', price: 8000, desc: 'Speakers, mixer, 2 mics, subwoofer' },
        { name: 'LED Disco Ball Light', price: 1500, desc: 'RGB remote control, party disco effect' },
        { name: 'PA System Portable', price: 5500, desc: 'Bluetooth, 100W, rechargeable battery' },
        { name: 'Canon EOS R5 Rental Kit', price: 12000, desc: '4K 120fps, full-day hire, includes lenses' },
        { name: 'Drone DJI Mavic 3 Pro', price: 15000, desc: 'Full day hire, 4K video, includes 3 batteries' },
        { name: 'Photo Booth Kiosk', price: 10000, desc: 'Instant prints, green screen, props included' },
        { name: 'Chafing Dish Set 6-Piece', price: 3500, desc: 'Stainless steel, includes fuel burners' },
        { name: 'Banquet Chairs 50-Pack', price: 5000, desc: 'White padded folding chairs, includes covers' },
        { name: 'Cocktail Table Set 10-Pack', price: 3500, desc: 'Round cocktail tables, 75cm tall, white' },
        { name: 'Stage Platform 4x8ft', price: 4500, desc: 'Portable, adjustable height, up to 500kg' },
        { name: 'Portable Dance Floor 12x12ft', price: 6000, desc: 'LED tiles, various colors, indoor/outdoor' },
        { name: 'Linen Hire Tablecloths 30-Pack', price: 2500, desc: 'White polyester, 90 inch rounds' },
        { name: 'Catering Service 50 People', price: 15000, desc: 'Full service, 3-course meal, staff included' },
        { name: 'Tent Chair Set 50-Seater', price: 6500, desc: 'White Samsonite chairs, 10 round tables' },
        { name: 'Ice Machine 50kg', price: 2000, desc: 'Commercial grade, flake ice, self-cleaning' },
        { name: 'Portable Bar Counter', price: 3000, desc: 'LED illuminated, portable, 2 sections' },
        { name: 'DJ Equipment Package', price: 10000, desc: 'Pioneer CDJ, DJM mixer, headphones' },
        { name: 'Karaoke Machine Pro', price: 2500, desc: 'Bluetooth, 2 wireless mics, 1000 songs' },
        { name: 'Balloon Arch Kit 100-Pack', price: 1200, desc: 'Self-sealing balloons, various colors, pump' },
        { name: 'Face Painting Kit', price: 800, desc: '24 colors, 30 brushes, sponges, stencils' },
        { name: 'Glitter Tattoo Kit', price: 600, desc: '50 stencils, 10 glitter colors, glue' },
        { name: 'Event Security 2 Guards', price: 4000, desc: 'Full day, uniformed, first-aid trained' },
        { name: 'Valet Parking Service', price: 3000, desc: '2 valets, up to 50 cars, 4hr minimum' },
        { name: 'Portable Toilet Luxury 2-Unit', price: 4500, desc: 'Flushing, handwash, mirror, AC unit' },
        { name: 'Generator 10KVA Silent', price: 6000, desc: 'Diesel, super silent, full-day hire' },
        { name: 'Catering Warmer Buffet Set', price: 2000, desc: '3-bay hot holding, electric, stainless' },
        { name: 'Waiter Service 4 Staff', price: 6000, desc: 'Uniformed, trained, 6-hour event' }
    ]},
    { key: 'studyessentials', label: 'Study Essentials', products: [
        { name: 'Laptop Desk Stand', price: 2200, desc: 'Adjustable, foldable, bamboo, cooling vents' },
        { name: 'Mechanical Pencil Set 5-Pack', price: 450, desc: '0.5mm, includes 50 lead refills' },
        { name: 'Premium Notebook 10-Pack A5', price: 800, desc: 'Hardcover, dotted grid, 200 pages each' },
        { name: 'Ergonomic Study Chair', price: 8500, desc: 'Height adjustable, lumbar support, mesh back' },
        { name: 'Desk Organizer 6-Compartment', price: 1200, desc: 'Acrylic, clear, for pens, phone, cards' },
        { name: 'Wi-Fi Range Extender', price: 2500, desc: 'AC1200, dual band, universal compatibility' },
        { name: 'Portable Whiteboard 60x90cm', price: 1800, desc: 'Double-sided, magnetic, with markers & eraser' },
        { name: 'Laminating Machine A4', price: 3500, desc: 'Fast warm-up, 250mm/min, auto shut-off' },
        { name: 'Bindi Printing Machine', price: 4500, desc: 'Comb binding, 20 sheets, heavy duty' },
        { name: 'Sticky Notes Assorted 20-Pack', price: 600, desc: 'Neon colors, 3x3 inch, 100 sheets each' },
        { name: 'Highlighter Set 6-Colors', price: 350, desc: 'Chisel tip, fluorescent, washable ink' },
        { name: 'Pencil Case Large Zippered', price: 550, desc: 'Canvas, multi-pocket, school or travel' },
        { name: 'Scientific Calculator fx-991EX', price: 2800, desc: 'Solar + battery, 552 functions' },
        { name: 'Graphic Calculator TI-84 Plus', price: 8500, desc: 'Preloaded apps, USB connectivity' },
        { name: 'USB Flash Drive 128GB', price: 750, desc: 'USB 3.0, metal body, retractable' },
        { name: 'External SSD 500GB', price: 4500, desc: 'NVMe, 1050MB/s read, compact design' },
        { name: 'Wireless Mouse 2.4GHz', price: 800, desc: 'Ergonomic, silent click, 12-month battery' },
        { name: 'Laptop Sleeve 15.6 inch', price: 650, desc: 'Neoprene, padded, water-resistant, black' },
        { name: 'Webcam Full HD 1080p', price: 2200, desc: 'Autofocus, built-in mic, USB-C, tripod' },
        { name: 'Headphones Noise Cancelling', price: 5500, desc: 'Over-ear, 30hr battery, Bluetooth 5.0' },
        { name: 'Desk Lamp LED with USB Port', price: 1800, desc: 'Dimmable, 5 color temps, touch control' },
        { name: 'Reading Light Clip-On', price: 450, desc: 'LED, USB rechargeable, flexible neck' },
        { name: 'Planner 2025-2026 Academic', price: 850, desc: '12-month, weekly & monthly view, hardcover' },
        { name: 'Sticky Tabs 8-Colors 200-Pack', price: 400, desc: 'Page flags, 5mm wide, printed numbers' },
        { name: 'Correction Tape 5-Pack', price: 350, desc: '5mm width, 8m tape, transparent' },
        { name: 'Scissors Set 3-Pack', price: 450, desc: 'Stainless steel, 6in, 7in, 8in' },
        { name: 'Paper Cutter A4 Guillotine', price: 1200, desc: '45cm cutting width, self-sharpening blade' },
        { name: 'Hole Punch Heavy Duty 2-Hole', price: 850, desc: '50-sheet capacity, adjustable margin' },
        { name: 'Stapler Heavy Duty 100-Sheet', price: 1500, desc: 'Office grade, includes 500 staples' },
        { name: 'Ring Binder 70mm 10-Pack', price: 600, desc: 'Black, 4 finger hole, 12-month calendar' }
    ]},
    { key: 'services', label: 'Services', products: [
        { name: 'Smart Light Bulb RGB 4-Pack', price: 1800, desc: 'Wi-Fi, 16M colors, voice control, 10W' },
        { name: 'LED Strip Lights 5M', price: 1200, desc: 'App control, music sync, self-adhesive' },
        { name: 'Nightstand 2-Drawer', price: 4500, desc: 'Solid wood, Scandinavian design, 2 colors' },
        { name: 'Wardrobe Organizer 6-Bin', price: 1500, desc: 'Fabric, collapsible, for closet shelving' },
        { name: 'Hanging Organizer 5-Pocket', price: 550, desc: 'Canvas, over-the-door, 5 compartments' },
        { name: 'Decorative Vase Set 3-Pack', price: 1200, desc: 'Ceramic, modern minimalist, white/grey' },
        { name: 'Wall Art Canvas 3-Piece', price: 2200, desc: 'Abstract prints, 30x40cm each, framed' },
        { name: 'Photo Frame Set 5-Pack', price: 850, desc: 'Assorted sizes, gold & white frames' },
        { name: 'Dreamcatcher Large', price: 650, desc: 'Handmade, feathers, LED fairy lights' },
        { name: 'LED Fairy Lights 100-LED', price: 450, desc: 'Battery powered, 10m copper wire' },
        { name: 'Bedside Caddy Organizer', price: 550, desc: 'Mesh, fits over mattress, 4 pockets' },
        { name: 'Under Bed Storage 60L', price: 1200, desc: 'Oxford fabric, wheels, zipper closure' },
        { name: 'Drawer Dividers 4-Pack', price: 600, desc: 'Bamboo, adjustable width, 2 sizes' },
        { name: 'Laundry Hamper 80L', price: 850, desc: 'Collapsible, bamboo frame, canvas bag' },
        { name: 'Curtain Tieback Set 4-Pack', price: 350, desc: 'Rope style, gold metal holders' },
        { name: 'Cushion Cover 12-Pack', price: 1800, desc: 'Velvet, 45x45cm, assorted jewel tones' },
        { name: 'Throw Blanket 130x170cm', price: 1500, desc: 'Fleece, lightweight, warm, charcoal grey' },
        { name: 'Weighted Blanket 5kg', price: 4500, desc: 'Glass beads, 150x200cm, cooling cover' },
        { name: 'Alarm Clock LED Digital', price: 650, desc: 'USB charging port, dimmer, FM radio' },
        { name: 'Indoor Plant Set 3-Pack', price: 2200, desc: 'Artificial, modern pots, 30cm tall each' },
        { name: 'Air Freshener Automatic', price: 1200, desc: 'Plugin, adjustable spray, 3 settings' },
        { name: 'Humidifier Ultrasonic 4L', price: 2800, desc: 'Cool mist, whisper quiet, auto shut-off' },
        { name: 'Essential Oil Diffuser 300ml', price: 1200, desc: 'Ceramic, LED mood light, timer settings' },
        { name: 'Mini Projector Starry Sky', price: 850, desc: 'USB powered, LED, star projection on ceiling' },
        { name: 'Glow in Dark Stars 100-Pack', price: 350, desc: 'Ceiling sticker, 3M adhesive, recharge by light' },
        { name: 'Smart Plug Wi-Fi 2-Pack', price: 1200, desc: 'Voice assistant compatible, scheduling' },
        { name: 'Motion Sensor LED Strip', price: 850, desc: 'Bedroom safe light, USB powered, 40 LEDs' },
        { name: 'Mini Fridge 30L', price: 6500, desc: 'Compact, thermoelectric, reversible door' },
        { name: 'Safe Box 20L', price: 3500, desc: 'Digital keypad, key override, wall mountable' },
        { name: 'Door Stopper 4-Pack', price: 350, desc: 'Rubber, double-sided, prevents door slam' }
    ]}
];

async function seed() {
    const client = await pool.connect();
    try {
        // Find or create a seller for seeding
        let sellerRes = await client.query('SELECT id FROM sellers LIMIT 1');
        let sellerId;
        if (sellerRes.rows.length === 0) {
            let newSeller = await client.query(
                "INSERT INTO sellers (google_id, email, name, whatsapp, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
                ['seed-user', 'seed@sokohub.com', 'SokoHub Seed', '+254700000000']
            );
            sellerId = newSeller.rows[0].id;
            console.log('Created seed seller ID:', sellerId);
        } else {
            sellerId = sellerRes.rows[0].id;
            console.log('Using existing seller ID:', sellerId);
        }

        let totalInserted = 0;
        for (const cat of CATEGORIES) {
            let count = 0;
            for (const prod of cat.products) {
                await client.query(
                    `INSERT INTO products (seller_id, name, price, category, description, image_url, is_active, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, true, NOW())`,
                    [sellerId, prod.name, prod.price, cat.key, prod.desc, null]
                );
                count++;
            }
            console.log(`  ${cat.label}: ${count} products inserted`);
            totalInserted += count;
        }
        console.log('\nTotal products inserted:', totalInserted);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();

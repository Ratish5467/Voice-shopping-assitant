
const raw = [
  {"name":"Apple","category":"Produce","brand":"FreshFarm","unit":"1kg","price":120,"tags":["apple","fruit","red apple","fresh"]},
  {"name":"Banana","category":"Produce","brand":"Tropica","unit":"1kg","price":50,"tags":["banana","fruit","fresh"]},
  {"name":"Orange","category":"Produce","brand":"CitrusCo","unit":"1kg","price":90,"tags":["orange","fruit","citrus"]},
  {"name":"Grapes Green","category":"Produce","brand":"VineFresh","unit":"500g","price":110,"tags":["grapes","green grapes","fruit"]},
  {"name":"Grapes Black","category":"Produce","brand":"VineFresh","unit":"500g","price":130,"tags":["grapes","black grapes","fruit"]},
  {"name":"Papaya","category":"Produce","brand":"FarmPick","unit":"1pc","price":60,"tags":["papaya","fruit","fresh"]},
  {"name":"Pineapple","category":"Produce","brand":"Tropica","unit":"1pc","price":85,"tags":["pineapple","fruit","tropical"]},
  {"name":"Watermelon","category":"Produce","brand":"GreenFarm","unit":"1pc","price":70,"tags":["watermelon","fruit","summer fruit"]},
  {"name":"Mango Alphonso","category":"Produce","brand":"HapusCo","unit":"1kg","price":180,"tags":["mango","alphonso","fruit"]},
  {"name":"Pomegranate","category":"Produce","brand":"RedRuby","unit":"1kg","price":180,"tags":["pomegranate","anar","fruit"]},

  {"name":"Tomato","category":"Vegetables","brand":"VeggieCo","unit":"1kg","price":30,"tags":["tomato","vegetable","fresh"]},
  {"name":"Potato","category":"Vegetables","brand":"VeggieCo","unit":"1kg","price":28,"tags":["potato","aloo","vegetable"]},
  {"name":"Onion","category":"Vegetables","brand":"VeggieCo","unit":"1kg","price":35,"tags":["onion","pyaaz","vegetable"]},
  {"name":"Carrot","category":"Vegetables","brand":"GreenFarm","unit":"500g","price":40,"tags":["carrot","gajar","vegetable"]},
  {"name":"Beetroot","category":"Vegetables","brand":"GreenFarm","unit":"500g","price":50,"tags":["beetroot","vegetable"]},
  {"name":"Spinach","category":"Vegetables","brand":"LeafFresh","unit":"1 bunch","price":25,"tags":["spinach","palak","greens"]},
  {"name":"Cabbage","category":"Vegetables","brand":"VeggieCo","unit":"1pc","price":35,"tags":["cabbage","vegetable"]},
  {"name":"Cauliflower","category":"Vegetables","brand":"VeggieCo","unit":"1pc","price":45,"tags":["cauliflower","gobi","vegetable"]},
  {"name":"Green Beans","category":"Vegetables","brand":"VeggieCo","unit":"500g","price":55,"tags":["beans","green beans","vegetable"]},
  {"name":"Lady Finger","category":"Vegetables","brand":"VeggieCo","unit":"500g","price":45,"tags":["okra","bhindi","vegetable"]},
  {"name":"Bitter Gourd","category":"Vegetables","brand":"GreenFarm","unit":"500g","price":60,"tags":["bitter gourd","karela","vegetable"]},
  {"name":"Pumpkin","category":"Vegetables","brand":"VeggieCo","unit":"1kg","price":40,"tags":["pumpkin","kaddu","vegetable"]},
  {"name":"Peas","category":"Vegetables","brand":"GreenFarm","unit":"500g","price":90,"tags":["peas","matar","vegetable"]},
  {"name":"Broccoli","category":"Vegetables","brand":"LeafFresh","unit":"250g","price":130,"tags":["broccoli","vegetable","greens"]},

  {"name":"Toor Dal","category":"Pulses","brand":"PulsePro","unit":"1kg","price":140,"tags":["toor dal","arhar dal","pulses"]},
  {"name":"Moong Dal","category":"Pulses","brand":"PulsePro","unit":"1kg","price":130,"tags":["moong dal","pulses"]},
  {"name":"Chana Dal","category":"Pulses","brand":"PulsePro","unit":"1kg","price":90,"tags":["chana dal","pulses"]},
  {"name":"Masoor Dal","category":"Pulses","brand":"PulsePro","unit":"1kg","price":110,"tags":["masoor dal","pulses"]},
  {"name":"Urad Dal","category":"Pulses","brand":"PulsePro","unit":"1kg","price":130,"tags":["urad dal","pulses"]},
  {"name":"Kabuli Chana","category":"Pulses","brand":"PulsePro","unit":"1kg","price":120,"tags":["kabuli chana","chickpeas","white chana"]},
  {"name":"Black Chana","category":"Pulses","brand":"PulsePro","unit":"1kg","price":75,"tags":["black chana","kala chana","pulses"]},
  {"name":"Rajma Red","category":"Pulses","brand":"PulsePro","unit":"1kg","price":150,"tags":["rajma","kidney beans"]},

  {"name":"Basmati Rice","category":"Rice","brand":"RiceHouse","unit":"1kg","price":120,"tags":["rice","basmati","long grain"]},
  {"name":"Brown Rice","category":"Rice","brand":"HealthyHarvest","unit":"1kg","price":90,"tags":["brown rice","rice","healthy"]},
  {"name":"Sona Masoori Rice","category":"Rice","brand":"RiceHouse","unit":"1kg","price":55,"tags":["sona masoori","rice"]},

  {"name":"Wheat Flour","category":"Grains","brand":"GrainCo","unit":"1kg","price":50,"tags":["wheat flour","atta","flour"]},
  {"name":"Maida","category":"Grains","brand":"GrainCo","unit":"1kg","price":45,"tags":["maida","refined flour","flour"]},
  {"name":"Rava","category":"Grains","brand":"GrainCo","unit":"1kg","price":40,"tags":["rava","sooji","semolina"]},
  {"name":"Poha","category":"Grains","brand":"GrainCo","unit":"1kg","price":45,"tags":["poha","flattened rice"]},

  {"name":"Oats","category":"Breakfast","brand":"HealthyHarvest","unit":"1kg","price":120,"tags":["oats","breakfast"]},
  {"name":"Cornflakes","category":"Breakfast","brand":"CerealCo","unit":"500g","price":140,"tags":["cornflakes","breakfast cereal"]},
  {"name":"Muesli","category":"Breakfast","brand":"HealthyHarvest","unit":"750g","price":260,"tags":["muesli","breakfast"]},

  {"name":"Milk Full Cream","category":"Dairy","brand":"Amul","unit":"1L","price":65,"tags":["milk","full cream","amul","dairy"]},
  {"name":"Milk Toned","category":"Dairy","brand":"Amul","unit":"1L","price":58,"tags":["milk","toned milk","amul"]},
  {"name":"Curd","category":"Dairy","brand":"Amul","unit":"500g","price":35,"tags":["curd","dahi","amul"]},
  {"name":"Paneer Fresh","category":"Dairy","brand":"Amul","unit":"200g","price":80,"tags":["paneer","cottage cheese"]},
  {"name":"Cheese Slices","category":"Dairy","brand":"Amul","unit":"200g","price":140,"tags":["cheese","slices","amul"]},
  {"name":"Butter Salted","category":"Dairy","brand":"Amul","unit":"100g","price":55,"tags":["butter","salted butter","amul"]},

  {"name":"Sunflower Oil","category":"Oils","brand":"Fortune","unit":"1L","price":130,"tags":["oil","sunflower oil"]},
  {"name":"Mustard Oil","category":"Oils","brand":"Fortune","unit":"1L","price":150,"tags":["mustard oil","sarson ka tel"]},
  {"name":"Groundnut Oil","category":"Oils","brand":"Fortune","unit":"1L","price":170,"tags":["groundnut oil","peanut oil"]},

  {"name":"Salt Iodized","category":"Essentials","brand":"Tata","unit":"1kg","price":22,"tags":["salt","iodized salt"]},
  {"name":"Sugar","category":"Essentials","brand":"SweetCo","unit":"1kg","price":48,"tags":["sugar","white sugar"]},
  {"name":"Jaggery","category":"Essentials","brand":"DesiFarm","unit":"1kg","price":60,"tags":["jaggery","gur"]},

  {"name":"Tea Powder","category":"Beverages","brand":"Tata","unit":"500g","price":260,"tags":["tea","chai","tea powder"]},
  {"name":"Coffee Instant","category":"Beverages","brand":"Bru","unit":"200g","price":350,"tags":["coffee","instant coffee"]},
  {"name":"Green Tea Bags","category":"Beverages","brand":"Lipton","unit":"100 pcs","price":180,"tags":["green tea","tea bags"]},

  {"name":"Eggs Pack","category":"Protein","brand":"FarmFresh","unit":"12 pcs","price":75,"tags":["eggs","protein"]},
  {"name":"Chicken Breast","category":"Meat","brand":"MeatMaster","unit":"1kg","price":260,"tags":["chicken","breast","meat"]},
  {"name":"Chicken Curry Cut","category":"Meat","brand":"MeatMaster","unit":"1kg","price":240,"tags":["chicken","curry cut"]},
  {"name":"Mutton","category":"Meat","brand":"MeatMaster","unit":"1kg","price":680,"tags":["mutton","goat meat"]},
  {"name":"Fish Rohu","category":"Meat","brand":"SeaFresh","unit":"1kg","price":300,"tags":["fish","rohu"]},

  {"name":"Tofu","category":"Protein","brand":"HealthyHarvest","unit":"200g","price":60,"tags":["tofu","soy"]},
  {"name":"Soya Chunks","category":"Protein","brand":"NutriCo","unit":"1kg","price":90,"tags":["soya chunks","soy","protein"]},

  {"name":"Ketchup","category":"Condiments","brand":"Heinz","unit":"500g","price":70,"tags":["ketchup","sauce","tomato sauce"]},
  {"name":"Mayonnaise","category":"Condiments","brand":"FunFoods","unit":"500g","price":120,"tags":["mayonnaise","mayo"]},
  {"name":"Chili Sauce","category":"Condiments","brand":"Ching's","unit":"500g","price":85,"tags":["chili sauce","hot sauce"]},
  {"name":"Vinegar","category":"Condiments","brand":"Ching's","unit":"500ml","price":35,"tags":["vinegar"]},
  {"name":"Soy Sauce","category":"Condiments","brand":"Ching's","unit":"500ml","price":75,"tags":["soy sauce"]},

  {"name":"Marie Biscuits","category":"Snacks","brand":"Britannia","unit":"200g","price":40,"tags":["biscuits","marie"]},
  {"name":"Cream Biscuits","category":"Snacks","brand":"Britannia","unit":"150g","price":30,"tags":["biscuits","cream"]},
  {"name":"Salted Chips","category":"Snacks","brand":"LayCo","unit":"100g","price":20,"tags":["chips","salted chips"]},
  {"name":"Masala Chips","category":"Snacks","brand":"LayCo","unit":"100g","price":20,"tags":["chips","masala chips"]},
  {"name":"Namkeen Mixture","category":"Snacks","brand":"Haldiram","unit":"400g","price":60,"tags":["namkeen","mixture"]},
  {"name":"Dark Chocolate","category":"Snacks","brand":"ChocoCo","unit":"100g","price":150,"tags":["chocolate","dark chocolate"]},
  {"name":"Milk Chocolate","category":"Snacks","brand":"ChocoCo","unit":"100g","price":100,"tags":["chocolate","milk chocolate"]},

  {"name":"Atta Noodles Masala","category":"Instant Foods","brand":"Maggi","unit":"70g","price":15,"tags":["noodles","instant","maggi"]},
  {"name":"Instant Pasta","category":"Instant Foods","brand":"Maggi","unit":"70g","price":25,"tags":["pasta","instant"]},
  {"name":"Instant Soup Tomato","category":"Instant Foods","brand":"Knorr","unit":"50g","price":25,"tags":["soup","tomato soup"]},

  {"name":"Butter Cookies","category":"Snacks","brand":"Britannia","unit":"150g","price":45,"tags":["cookies","butter cookies"]},
  {"name":"Rusk","category":"Bakery","brand":"Britannia","unit":"300g","price":40,"tags":["rusk","toast"]},

  {"name":"Honey","category":"Essentials","brand":"Dabur","unit":"250g","price":120,"tags":["honey","pure honey"]},
  {"name":"Peanut Butter","category":"Essentials","brand":"NutriCo","unit":"400g","price":160,"tags":["peanut butter","protein"]},

  {"name":"Coconut Water","category":"Beverages","brand":"Nature's","unit":"200ml","price":35,"tags":["coconut water","drink"]},
  {"name":"Energy Drink","category":"Beverages","brand":"Charge","unit":"500ml","price":110,"tags":["energy drink"]},

  {"name":"Detergent Powder","category":"Household","brand":"SurfCo","unit":"1kg","price":110,"tags":["detergent","washing powder"]},
  {"name":"Dishwash Liquid","category":"Household","brand":"Pril","unit":"500ml","price":60,"tags":["dishwash","liquid"]},
  {"name":"Toilet Cleaner","category":"Household","brand":"Harpic","unit":"500ml","price":85,"tags":["cleaner","toilet"]},
  {"name":"Floor Cleaner","category":"Household","brand":"Lizol","unit":"1L","price":100,"tags":["floor cleaner"]},
  {"name":"Garbage Bags Medium","category":"Household","brand":"CleanCo","unit":"30 pcs","price":65,"tags":["garbage bags"]},

  {"name":"Shampoo Anti-Dandruff","category":"Personal Care","brand":"Head&Shoulders","unit":"180ml","price":120,"tags":["shampoo","anti dandruff"]},
  {"name":"Shampoo Smooth","category":"Personal Care","brand":"Dove","unit":"180ml","price":140,"tags":["shampoo","smooth"]},
  {"name":"Soap Bathing","category":"Personal Care","brand":"Lux","unit":"3 pcs","price":50,"tags":["soap","bathing soap"]},
  {"name":"Toothpaste Mint","category":"Personal Care","brand":"Colgate","unit":"200g","price":90,"tags":["toothpaste","mint"]},
  {"name":"Toothbrush Soft","category":"Personal Care","brand":"Colgate","unit":"1 pc","price":25,"tags":["toothbrush","soft brush"]},
  {"name":"Sweet Corn","category":"Vegetables","brand":"GreenFarm","unit":"2 pcs","price":40,"tags":["sweet corn","corn","vegetable"]},
  {"name":"Red Capsicum","category":"Vegetables","brand":"LeafFresh","unit":"250g","price":70,"tags":["capsicum","bell pepper","red capsicum"]},
  {"name":"Yellow Capsicum","category":"Vegetables","brand":"LeafFresh","unit":"250g","price":75,"tags":["yellow capsicum","bell pepper"]},
  {"name":"Green Capsicum","category":"Vegetables","brand":"LeafFresh","unit":"250g","price":45,"tags":["capsicum","green capsicum"]},
  {"name":"Spring Onion","category":"Vegetables","brand":"LeafFresh","unit":"1 bunch","price":25,"tags":["spring onion","greens"]},
  {"name":"Curry Leaves","category":"Vegetables","brand":"LeafFresh","unit":"1 bunch","price":10,"tags":["curry leaves","herbs"]},
  {"name":"Mint Leaves","category":"Vegetables","brand":"LeafFresh","unit":"1 bunch","price":15,"tags":["mint","pudina","herbs"]},
  {"name":"Drumstick","category":"Vegetables","brand":"GreenFarm","unit":"250g","price":55,"tags":["drumstick","vegetable"]},
  {"name":"Sweet Potato","category":"Vegetables","brand":"VeggieCo","unit":"1kg","price":60,"tags":["sweet potato","shakarkand","vegetable"]},
  {"name":"Arbi","category":"Vegetables","brand":"VeggieCo","unit":"500g","price":50,"tags":["arbi","colocasia"]},

  {"name":"Apple Juice","category":"Beverages","brand":"Real","unit":"1L","price":110,"tags":["apple juice","juice"]},
  {"name":"Orange Juice","category":"Beverages","brand":"Real","unit":"1L","price":120,"tags":["orange juice","juice"]},
  {"name":"Guava Juice","category":"Beverages","brand":"Real","unit":"1L","price":125,"tags":["guava juice","juice"]},
  {"name":"Mixed Fruit Juice","category":"Beverages","brand":"Tropicana","unit":"1L","price":130,"tags":["mixed fruit juice","juice"]},
  {"name":"Lassi Sweet","category":"Beverages","brand":"Amul","unit":"200ml","price":25,"tags":["lassi","sweet lassi"]},
  {"name":"Chaas","category":"Beverages","brand":"Amul","unit":"200ml","price":20,"tags":["chaas","buttermilk"]},

  {"name":"Idli Batter","category":"Convenience","brand":"iD","unit":"1kg","price":65,"tags":["idli batter","batter"]},
  {"name":"Dosa Batter","category":"Convenience","brand":"iD","unit":"1kg","price":75,"tags":["dosa batter","batter"]},
  {"name":"Chapati Ready-to-eat","category":"Convenience","brand":"iD","unit":"10 pcs","price":55,"tags":["chapati","roti","ready to eat"]},
  {"name":"Paratha Plain","category":"Convenience","brand":"iD","unit":"6 pcs","price":70,"tags":["paratha","frozen paratha"]},

  {"name":"Frozen Green Peas","category":"Frozen Foods","brand":"FreshCo","unit":"1kg","price":130,"tags":["peas","frozen peas"]},
  {"name":"Frozen French Fries","category":"Frozen Foods","brand":"McCain","unit":"750g","price":120,"tags":["french fries","frozen"]},
  {"name":"Frozen Nuggets","category":"Frozen Foods","brand":"McCain","unit":"750g","price":210,"tags":["nuggets","frozen"]},
  {"name":"Frozen Aloo Tikki","category":"Frozen Foods","brand":"McCain","unit":"760g","price":180,"tags":["aloo tikki","frozen"]},
  {"name":"Frozen Paratha","category":"Frozen Foods","brand":"FreshCo","unit":"10 pcs","price":120,"tags":["paratha","frozen paratha"]},

  {"name":"Whole Wheat Bread","category":"Bakery","brand":"Britannia","unit":"400g","price":45,"tags":["bread","whole wheat"]},
  {"name":"Milk Bread","category":"Bakery","brand":"Britannia","unit":"400g","price":40,"tags":["bread","milk bread"]},
  {"name":"Multigrain Bread","category":"Bakery","brand":"Britannia","unit":"400g","price":55,"tags":["bread","multigrain bread"]},
  {"name":"Burger Buns","category":"Bakery","brand":"FreshCo","unit":"4 pcs","price":40,"tags":["burger buns"]},
  {"name":"Hot Dog Buns","category":"Bakery","brand":"FreshCo","unit":"4 pcs","price":40,"tags":["hot dog buns"]},

  {"name":"Idli Rava","category":"Grains","brand":"GrainCo","unit":"1kg","price":45,"tags":["idli rava","rava"]},
  {"name":"Besan","category":"Grains","brand":"GrainCo","unit":"1kg","price":65,"tags":["besan","gram flour"]},
  {"name":"Millet Flour","category":"Grains","brand":"HealthyHarvest","unit":"1kg","price":80,"tags":["millet flour","jowar flour","bajra flour"]},
  {"name":"Bajra Flour","category":"Grains","brand":"GrainCo","unit":"1kg","price":55,"tags":["bajra flour","millet"]},
  {"name":"Jowar Flour","category":"Grains","brand":"GrainCo","unit":"1kg","price":50,"tags":["jowar flour","millet"]},

  {"name":"Poha Thick","category":"Grains","brand":"GrainCo","unit":"1kg","price":48,"tags":["poha","thick poha"]},
  {"name":"Poha Thin","category":"Grains","brand":"GrainCo","unit":"1kg","price":45,"tags":["poha","thin poha"]},
  {"name":"Idli Rice","category":"Rice","brand":"RiceHouse","unit":"1kg","price":60,"tags":["idli rice","rice"]},
  {"name":"Kolam Rice","category":"Rice","brand":"RiceHouse","unit":"1kg","price":65,"tags":["kolam rice","rice"]},

  {"name":"Curd Greek","category":"Dairy","brand":"Epigamia","unit":"100g","price":40,"tags":["greek yogurt","curd","yogurt"]},
  {"name":"Flavored Yogurt Mango","category":"Dairy","brand":"Amul","unit":"100g","price":25,"tags":["yogurt","mango yogurt"]},
  {"name":"Flavored Yogurt Strawberry","category":"Dairy","brand":"Amul","unit":"100g","price":25,"tags":["yogurt","strawberry yogurt"]},

  {"name":"Cheese Block","category":"Dairy","brand":"Amul","unit":"200g","price":180,"tags":["cheese block","cheddar cheese"]},
  {"name":"Cheese Mozzarella","category":"Dairy","brand":"Amul","unit":"200g","price":150,"tags":["mozzarella","cheese","amul"]},
  
  {"name":"Instant Coffee Classic","category":"Beverages","brand":"Nescafe","unit":"200g","price":360,"tags":["coffee","instant coffee"]},
  {"name":"Instant Coffee Gold","category":"Beverages","brand":"Nescafe","unit":"100g","price":420,"tags":["coffee","premium coffee"]},

  {"name":"Jeera","category":"Spices","brand":"Everest","unit":"100g","price":55,"tags":["jeera","cumin"]},
  {"name":"Turmeric Powder","category":"Spices","brand":"Everest","unit":"200g","price":45,"tags":["haldi","turmeric"]},
  {"name":"Red Chili Powder","category":"Spices","brand":"Everest","unit":"200g","price":65,"tags":["chili powder","lal mirch"]},
  {"name":"Coriander Powder","category":"Spices","brand":"Everest","unit":"200g","price":50,"tags":["dhaniya powder","coriander"]},
  {"name":"Garam Masala","category":"Spices","brand":"Everest","unit":"100g","price":70,"tags":["garam masala","spices"]},

  {"name":"Black Pepper","category":"Spices","brand":"Everest","unit":"100g","price":120,"tags":["black pepper","kali mirch"]},
  {"name":"Fenugreek Seeds","category":"Spices","brand":"Everest","unit":"200g","price":40,"tags":["fenugreek","methi seeds"]},
  {"name":"Mustard Seeds","category":"Spices","brand":"Everest","unit":"200g","price":30,"tags":["mustard","sarson seeds"]},

  {"name":"Ginger Garlic Paste","category":"Spices","brand":"Smith","unit":"200g","price":45,"tags":["ginger garlic paste","paste"]},

  {"name":"Ketchup Hot & Sweet","category":"Condiments","brand":"Kissan","unit":"500g","price":85,"tags":["ketchup","hot and sweet ketchup"]},
  {"name":"Pickle Mango","category":"Condiments","brand":"Mother's","unit":"400g","price":110,"tags":["pickle","mango pickle"]},
  {"name":"Pickle Lemon","category":"Condiments","brand":"Mother's","unit":"400g","price":105,"tags":["pickle","lemon pickle"]},
  {"name":"Pickle Mixed","category":"Condiments","brand":"Mother's","unit":"400g","price":115,"tags":["pickle","mixed pickle"]},

  {"name":"Ice Cream Vanilla","category":"Frozen Foods","brand":"Vadilal","unit":"1L","price":180,"tags":["ice cream","vanilla ice cream"]},
  {"name":"Ice Cream Chocolate","category":"Frozen Foods","brand":"Vadilal","unit":"1L","price":190,"tags":["ice cream","chocolate ice cream"]},
  {"name":"Ice Cream Strawberry","category":"Frozen Foods","brand":"Vadilal","unit":"1L","price":190,"tags":["ice cream","strawberry ice cream"]},

  {"name":"Butter Scotch Ice Cream","category":"Frozen Foods","brand":"Kwality Walls","unit":"700ml","price":200,"tags":["ice cream","butterscotch"]},

  {"name":"Corn Flour","category":"Baking","brand":"BakeMate","unit":"500g","price":55,"tags":["corn flour","baking"]},
  {"name":"Baking Powder","category":"Baking","brand":"BakeMate","unit":"100g","price":30,"tags":["baking powder","baking"]},
  {"name":"Baking Soda","category":"Baking","brand":"BakeMate","unit":"100g","price":25,"tags":["baking soda","soda"]},
  {"name":"Cocoa Powder","category":"Baking","brand":"BakeMate","unit":"200g","price":85,"tags":["cocoa powder","baking"]},

  {"name":"Vanilla Essence","category":"Baking","brand":"BakeMate","unit":"20ml","price":35,"tags":["vanilla essence","baking"]},

  {"name":"Jam Mixed Fruit","category":"Spread","brand":"Kissan","unit":"500g","price":110,"tags":["jam","mixed fruit jam"]},
  {"name":"Jam Strawberry","category":"Spread","brand":"Kissan","unit":"500g","price":115,"tags":["jam","strawberry jam"]},

  {"name":"Almonds","category":"Dry Fruits","brand":"NutriCo","unit":"500g","price":380,"tags":["almonds","badam"]},
  {"name":"Cashews","category":"Dry Fruits","brand":"NutriCo","unit":"500g","price":450,"tags":["cashew","kaju"]},
  {"name":"Raisins","category":"Dry Fruits","brand":"NutriCo","unit":"500g","price":180,"tags":["raisins","kishmish"]},
  {"name":"Pistachios","category":"Dry Fruits","brand":"NutriCo","unit":"500g","price":600,"tags":["pista","pistachios"]},

  {"name":"Shaving Foam","category":"Personal Care","brand":"Gillette","unit":"200g","price":180,"tags":["shaving foam","shaving"]},
  {"name":"After Shave Lotion","category":"Personal Care","brand":"Gillette","unit":"100ml","price":190,"tags":["after shave","lotion"]},
  {"name":"Hair Gel","category":"Personal Care","brand":"SetWet","unit":"50g","price":50,"tags":["hair gel"]},
  {"name":"Face Wash Neem","category":"Personal Care","brand":"Himalaya","unit":"150ml","price":95,"tags":["face wash","neem"]},
  {"name":"Face Wash Lemon","category":"Personal Care","brand":"Himalaya","unit":"150ml","price":95,"tags":["face wash","lemon"]},

  {"name":"Handwash Liquid","category":"Personal Care","brand":"Dettol","unit":"200ml","price":45,"tags":["handwash","dettol"]},
  {"name":"Hand Sanitizer","category":"Personal Care","brand":"Dettol","unit":"50ml","price":30,"tags":["sanitizer","hand sanitizer"]},

  {"name":"Mop Floor Cleaning","category":"Household","brand":"CleanCo","unit":"1 pc","price":250,"tags":["mop","floor cleaning"]},
  {"name":"Steel Scrubber","category":"Household","brand":"CleanCo","unit":"3 pcs","price":35,"tags":["scrubber","utensils"]},
  {"name":"Sponge Wipes","category":"Household","brand":"CleanCo","unit":"5 pcs","price":60,"tags":["wipes","kitchen wipes"]},

  {"name":"Air Freshener Rose","category":"Household","brand":"Odonil","unit":"50g","price":55,"tags":["air freshener","rose"]},
  {"name":"Air Freshener Jasmine","category":"Household","brand":"Odonil","unit":"50g","price":55,"tags":["air freshener","jasmine"]},

  {"name":"Toilet Tissue Roll","category":"Household","brand":"CleanCo","unit":"4 pcs","price":75,"tags":["tissue","toilet roll"]},
  {"name":"Kitchen Towel","category":"Household","brand":"CleanCo","unit":"2 pcs","price":95,"tags":["kitchen towel","wipes"]},

  {"name":"Handmade Soap Sandal","category":"Personal Care","brand":"Khadi","unit":"125g","price":65,"tags":["soap","sandal soap"]},
  {"name":"Handmade Soap Neem","category":"Personal Care","brand":"Khadi","unit":"125g","price":65,"tags":["soap","neem soap"]},

  {"name":"Face Cream Aloe","category":"Personal Care","brand":"Nivea","unit":"100ml","price":110,"tags":["face cream","aloe"]},
  {"name":"Face Cream Soft","category":"Personal Care","brand":"Nivea","unit":"100ml","price":120,"tags":["face cream","soft"]},

  {"name":"Lip Balm Strawberry","category":"Personal Care","brand":"Nivea","unit":"5g","price":70,"tags":["lip balm","strawberry"]},
  {"name":"Lip Balm Cherry","category":"Personal Care","brand":"Nivea","unit":"5g","price":70,"tags":["lip balm","cherry"]},

  {"name":"Chocolate Cookies","category":"Snacks","brand":"ChocoCo","unit":"150g","price":60,"tags":["cookies","chocolate cookies"]},
  {"name":"Salted Crackers","category":"Snacks","brand":"CrispyCo","unit":"200g","price":45,"tags":["crackers","salted crackers"]},

  {"name":"Trail Mix","category":"Dry Fruits","brand":"NutriCo","unit":"250g","price":180,"tags":["trail mix","nuts","dry fruits"]},
  {"name":"Chia Seeds","category":"Superfoods","brand":"HealthyHarvest","unit":"250g","price":150,"tags":["chia seeds","superfood"]},
  {"name":"Flax Seeds","category":"Superfoods","brand":"HealthyHarvest","unit":"250g","price":100,"tags":["flax seeds","superfood"]},

  {"name":"Green Moong Whole","category":"Pulses","brand":"PulsePro","unit":"1kg","price":120,"tags":["green moong","whole moong","pulses"]},
  {"name":"Black Urad Whole","category":"Pulses","brand":"PulsePro","unit":"1kg","price":130,"tags":["urad","whole urad"]},

  {"name":"Protein Powder Chocolate","category":"Nutrition","brand":"NutriPro","unit":"1kg","price":850,"tags":["protein powder","chocolate protein"]},
  {"name":"Protein Powder Vanilla","category":"Nutrition","brand":"NutriPro","unit":"1kg","price":850,"tags":["protein powder","vanilla protein"]},

  {"name":"Sports Drink Lemon","category":"Beverages","brand":"Enerzal","unit":"500ml","price":35,"tags":["sports drink","lemon drink"]},
  {"name":"Sports Drink Orange","category":"Beverages","brand":"Enerzal","unit":"500ml","price":35,"tags":["sports drink","orange drink"]}
];

const items = raw.map((it, idx) => ({
  ...it,
  id: `item-${idx + 1}`
}));

export default items;


'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Apple,
  Flame,
  Wheat,
  Droplets,
  Beef,
  Salad,
  Calculator,
  Target,
  TrendingUp,
  X,
  Utensils,
  Sparkles,
  Calendar,
  Save,
  History,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Indonesian food database with nutritional values per 100g
const foodDatabase = [
  // Carbohydrates
  { id: 1, name: 'Nasi Putih', category: 'Karbohidrat', calories: 175, protein: 3.5, carbs: 38, fat: 0.3, fiber: 0.9, servingSize: 150, unit: 'gram' },
  { id: 2, name: 'Nasi Goreng', category: 'Karbohidrat', calories: 206, protein: 4.2, carbs: 32, fat: 7.5, fiber: 1.2, servingSize: 200, unit: 'gram' },
  { id: 3, name: 'Mie Goreng', category: 'Karbohidrat', calories: 186, protein: 5.3, carbs: 28, fat: 6.2, fiber: 1.5, servingSize: 200, unit: 'gram' },
  { id: 4, name: 'Roti Tawar', category: 'Karbohidrat', calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, servingSize: 50, unit: 'gram' },
  { id: 5, name: 'Kentang Rebus', category: 'Karbohidrat', calories: 87, protein: 1.9, carbs: 20, fat: 0.1, fiber: 1.8, servingSize: 150, unit: 'gram' },
  { id: 6, name: 'Singkong Rebus', category: 'Karbohidrat', calories: 160, protein: 0.4, carbs: 38, fat: 0.3, fiber: 1.8, servingSize: 100, unit: 'gram' },
  { id: 7, name: 'Ubi Rebus', category: 'Karbohidrat', calories: 140, protein: 1.2, carbs: 33, fat: 0.1, fiber: 3.0, servingSize: 100, unit: 'gram' },
  { id: 8, name: 'Lontong', category: 'Karbohidrat', calories: 172, protein: 3.2, carbs: 38, fat: 0.2, fiber: 1.1, servingSize: 150, unit: 'gram' },
  { id: 9, name: 'Bihun Goreng', category: 'Karbohidrat', calories: 175, protein: 4.5, carbs: 30, fat: 5.5, fiber: 1.2, servingSize: 150, unit: 'gram' },
  { id: 9.1, name: 'Ketupat', category: 'Karbohidrat', calories: 165, protein: 3.0, carbs: 36, fat: 0.2, fiber: 1.0, servingSize: 150, unit: 'gram' },
  { id: 9.2, name: 'Nasi Kuning', category: 'Karbohidrat', calories: 195, protein: 3.8, carbs: 38, fat: 2.5, fiber: 1.0, servingSize: 150, unit: 'gram' },
  { id: 9.3, name: 'Croissant', category: 'Karbohidrat', calories: 406, protein: 8, carbs: 45, fat: 21, fiber: 2.5, servingSize: 60, unit: 'gram' },
  { id: 9.4, name: 'Pasta/Spaghetti', category: 'Karbohidrat', calories: 158, protein: 5.8, carbs: 31, fat: 0.9, fiber: 1.8, servingSize: 150, unit: 'gram' },
  { id: 9.5, name: 'Oatmeal', category: 'Karbohidrat', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7, servingSize: 100, unit: 'gram' },
  { id: 9.6, name: 'Pancake', category: 'Karbohidrat', calories: 227, protein: 6, carbs: 28, fat: 10, fiber: 1, servingSize: 100, unit: 'gram' },
  
  // Protein
  { id: 10, name: 'Ayam Goreng', category: 'Protein', calories: 246, protein: 28, carbs: 2.5, fat: 14, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 11, name: 'Ayam Bakar', category: 'Protein', calories: 189, protein: 29, carbs: 0.5, fat: 7, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 12, name: 'Ikan Goreng', category: 'Protein', calories: 205, protein: 24, carbs: 3.5, fat: 10, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 13, name: 'Ikan Bakar', category: 'Protein', calories: 152, protein: 26, carbs: 0, fat: 4, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 14, name: 'Telur Rebus', category: 'Protein', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, servingSize: 50, unit: 'gram' },
  { id: 15, name: 'Telur Goreng', category: 'Protein', calories: 196, protein: 14, carbs: 1.2, fat: 15, fiber: 0, servingSize: 50, unit: 'gram' },
  { id: 16, name: 'Daging Sapi', category: 'Protein', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 17, name: 'Tempe Goreng', category: 'Protein', calories: 193, protein: 18, carbs: 8, fat: 11, fiber: 2.5, servingSize: 50, unit: 'gram' },
  { id: 18, name: 'Tahu Goreng', category: 'Protein', calories: 144, protein: 12, carbs: 3, fat: 9, fiber: 0.8, servingSize: 50, unit: 'gram' },
  { id: 19, name: 'Udang', category: 'Protein', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 20, name: 'Cumi-Cumi', category: 'Protein', calories: 92, protein: 18, carbs: 3, fat: 1, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 21, name: 'Ayam Panggang', category: 'Protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 22, name: 'Dada Ayam Rebus', category: 'Protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 23, name: 'Paha Ayam', category: 'Protein', calories: 209, protein: 26, carbs: 0, fat: 11, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 24, name: 'Ikan Salmon', category: 'Protein', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 25, name: 'Ikan Tongkol', category: 'Protein', calories: 132, protein: 28, carbs: 0, fat: 1, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 26, name: 'Ikan Lele', category: 'Protein', calories: 144, protein: 18, carbs: 0, fat: 7, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 27, name: 'Telur Dadar', category: 'Protein', calories: 147, protein: 10, carbs: 1.5, fat: 11, fiber: 0, servingSize: 50, unit: 'gram' },
  { id: 28, name: 'Kacang Tanah', category: 'Protein', calories: 567, protein: 25, carbs: 16, fat: 49, fiber: 8.5, servingSize: 30, unit: 'gram' },
  { id: 29, name: 'Kacang Almond', category: 'Protein', calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, servingSize: 30, unit: 'gram' },
  { id: 29.1, name: 'Daging Kambing', category: 'Protein', calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 29.2, name: 'Ati Ayam', category: 'Protein', calories: 167, protein: 20, carbs: 1, fat: 9, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 29.3, name: 'Ikan Teri', category: 'Protein', calories: 210, protein: 32, carbs: 0, fat: 8, fiber: 0, servingSize: 50, unit: 'gram' },
  { id: 29.4, name: 'Ikan Patin', category: 'Protein', calories: 145, protein: 20, carbs: 0, fat: 6, fiber: 0, servingSize: 100, unit: 'gram' },
  
  // Vegetables
  { id: 30, name: 'Kangkung Tumis', category: 'Sayuran', calories: 45, protein: 2.5, carbs: 5, fat: 2.5, fiber: 2.0, servingSize: 100, unit: 'gram' },
  { id: 31, name: 'Bayam Rebus', category: 'Sayuran', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, servingSize: 100, unit: 'gram' },
  { id: 32, name: 'Capcay', category: 'Sayuran', calories: 65, protein: 3, carbs: 8, fat: 2.5, fiber: 3.0, servingSize: 150, unit: 'gram' },
  { id: 33, name: 'Sop Sayuran', category: 'Sayuran', calories: 48, protein: 2, carbs: 7, fat: 1.5, fiber: 2.5, servingSize: 200, unit: 'ml' },
  { id: 34, name: 'Sayur Lodeh', category: 'Sayuran', calories: 75, protein: 3, carbs: 6, fat: 5, fiber: 2.0, servingSize: 150, unit: 'gram' },
  { id: 35, name: 'Tumis Buncis', category: 'Sayuran', calories: 52, protein: 2.2, carbs: 6, fat: 2.8, fiber: 2.5, servingSize: 100, unit: 'gram' },
  { id: 36, name: 'Urap', category: 'Sayuran', calories: 112, protein: 4, carbs: 7, fat: 8, fiber: 3.5, servingSize: 100, unit: 'gram' },
  { id: 37, name: 'Karedok', category: 'Sayuran', calories: 125, protein: 5, carbs: 10, fat: 7, fiber: 4.0, servingSize: 100, unit: 'gram' },
  { id: 38, name: 'Wortel Rebus', category: 'Sayuran', calories: 35, protein: 0.8, carbs: 8, fat: 0.2, fiber: 2.8, servingSize: 100, unit: 'gram' },
  { id: 39, name: 'Brokoli Rebus', category: 'Sayuran', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, servingSize: 100, unit: 'gram' },
  { id: 40, name: 'Kol/Timun', category: 'Sayuran', calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.4, servingSize: 100, unit: 'gram' },
  { id: 41, name: 'Terong Tumis', category: 'Sayuran', calories: 35, protein: 1, carbs: 8, fat: 0.2, fiber: 3, servingSize: 100, unit: 'gram' },
  { id: 42, name: 'Labu Siam', category: 'Sayuran', calories: 28, protein: 0.6, carbs: 6, fat: 0.1, fiber: 1.5, servingSize: 100, unit: 'gram' },
  { id: 43, name: 'Sawi Putih', category: 'Sayuran', calories: 13, protein: 1.5, carbs: 2.2, fat: 0.2, fiber: 1.2, servingSize: 100, unit: 'gram' },
  { id: 44, name: 'Daun Singkong', category: 'Sayuran', calories: 37, protein: 2.8, carbs: 7, fat: 0.3, fiber: 2.0, servingSize: 100, unit: 'gram' },
  { id: 45, name: 'Pare Tumis', category: 'Sayuran', calories: 42, protein: 1.5, carbs: 8, fat: 0.5, fiber: 2.8, servingSize: 100, unit: 'gram' },
  { id: 46, name: 'Toge/Gembus', category: 'Sayuran', calories: 30, protein: 3.2, carbs: 5, fat: 0.2, fiber: 1.8, servingSize: 100, unit: 'gram' },
  { id: 47, name: 'Jamur Tiram', category: 'Sayuran', calories: 33, protein: 3.3, carbs: 5, fat: 0.3, fiber: 2.4, servingSize: 100, unit: 'gram' },
  { id: 48, name: 'Paprika', category: 'Sayuran', calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, servingSize: 100, unit: 'gram' },
  { id: 49, name: 'Tomat', category: 'Sayuran', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, servingSize: 100, unit: 'gram' },
  
  // Fruits
  { id: 50, name: 'Pisang', category: 'Buah', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, servingSize: 100, unit: 'gram' },
  { id: 51, name: 'Apel', category: 'Buah', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, servingSize: 150, unit: 'gram' },
  { id: 52, name: 'Jeruk', category: 'Buah', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, servingSize: 150, unit: 'gram' },
  { id: 53, name: 'Mangga', category: 'Buah', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, servingSize: 150, unit: 'gram' },
  { id: 54, name: 'Semangka', category: 'Buah', calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4, servingSize: 200, unit: 'gram' },
  { id: 55, name: 'Melon', category: 'Buah', calories: 34, protein: 0.8, carbs: 8, fat: 0.2, fiber: 0.9, servingSize: 200, unit: 'gram' },
  { id: 56, name: 'Pepaya', category: 'Buah', calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7, servingSize: 150, unit: 'gram' },
  { id: 57, name: 'Anggur', category: 'Buah', calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, servingSize: 100, unit: 'gram' },
  { id: 58, name: 'Jambu Biji', category: 'Buah', calories: 68, protein: 2.6, carbs: 14, fat: 1, fiber: 5.4, servingSize: 100, unit: 'gram' },
  { id: 59, name: 'Alpukat', category: 'Buah', calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, servingSize: 100, unit: 'gram' },
  { id: 60, name: 'Nanas', category: 'Buah', calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, servingSize: 100, unit: 'gram' },
  { id: 61, name: 'Strawberry', category: 'Buah', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, servingSize: 100, unit: 'gram' },
  { id: 62, name: 'Rambutan', category: 'Buah', calories: 68, protein: 0.9, carbs: 16, fat: 0.3, fiber: 1.3, servingSize: 100, unit: 'gram' },
  { id: 63, name: 'Durian', category: 'Buah', calories: 147, protein: 1.5, carbs: 27, fat: 5, fiber: 3.8, servingSize: 100, unit: 'gram' },
  { id: 64, name: 'Nangka', category: 'Buah', calories: 95, protein: 1.5, carbs: 23, fat: 0.6, fiber: 1.5, servingSize: 100, unit: 'gram' },
  { id: 65, name: 'Salak', category: 'Buah', calories: 77, protein: 0.5, carbs: 20, fat: 0.2, fiber: 3.9, servingSize: 100, unit: 'gram' },
  { id: 66, name: 'Sirsak', category: 'Buah', calories: 66, protein: 1, carbs: 17, fat: 0.3, fiber: 3.3, servingSize: 100, unit: 'gram' },
  { id: 67, name: 'Kelengkeng', category: 'Buah', calories: 60, protein: 1.3, carbs: 15, fat: 0.1, fiber: 1.1, servingSize: 100, unit: 'gram' },
  { id: 68, name: 'Markisa', category: 'Buah', calories: 97, protein: 2.2, carbs: 23, fat: 0.7, fiber: 10.4, servingSize: 100, unit: 'gram' },
  { id: 69, name: 'Kiwi', category: 'Buah', calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3, servingSize: 100, unit: 'gram' },
  
  // Beverages
  { id: 70, name: 'Susu Sapi', category: 'Minuman', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, servingSize: 200, unit: 'ml' },
  { id: 71, name: 'Es Teh Manis', category: 'Minuman', calories: 40, protein: 0, carbs: 10, fat: 0, fiber: 0, servingSize: 250, unit: 'ml' },
  { id: 72, name: 'Jus Jeruk', category: 'Minuman', calories: 45, protein: 0.7, carbs: 10, fat: 0.2, fiber: 0.3, servingSize: 200, unit: 'ml' },
  { id: 73, name: 'Jus Alpukat', category: 'Minuman', calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, servingSize: 200, unit: 'ml' },
  { id: 74, name: 'Kopi Susu', category: 'Minuman', calories: 75, protein: 2.5, carbs: 10, fat: 3, fiber: 0, servingSize: 200, unit: 'ml' },
  { id: 75, name: 'Teh Tawar', category: 'Minuman', calories: 2, protein: 0, carbs: 0.5, fat: 0, fiber: 0, servingSize: 250, unit: 'ml' },
  { id: 76, name: 'Susu Kedelai', category: 'Minuman', calories: 54, protein: 3.3, carbs: 5.6, fat: 2.1, fiber: 0.6, servingSize: 200, unit: 'ml' },
  { id: 77, name: 'Yogurt', category: 'Minuman', calories: 59, protein: 10, carbs: 3.6, fat: 0.7, fiber: 0, servingSize: 150, unit: 'ml' },
  { id: 78, name: 'Es Jeruk', category: 'Minuman', calories: 45, protein: 0.5, carbs: 11, fat: 0.1, fiber: 0.2, servingSize: 250, unit: 'ml' },
  { id: 79, name: 'Jus Mangga', category: 'Minuman', calories: 60, protein: 0.4, carbs: 15, fat: 0.2, fiber: 0.8, servingSize: 200, unit: 'ml' },
  { id: 80, name: 'Jus Wortel', category: 'Minuman', calories: 40, protein: 0.9, carbs: 9, fat: 0.2, fiber: 0.8, servingSize: 200, unit: 'ml' },
  { id: 81, name: 'Es Campur', category: 'Minuman', calories: 180, protein: 2, carbs: 35, fat: 4, fiber: 1.5, servingSize: 250, unit: 'ml' },
  { id: 82, name: 'Es Cendol', category: 'Minuman', calories: 210, protein: 1.5, carbs: 42, fat: 3, fiber: 0.5, servingSize: 250, unit: 'ml' },
  { id: 83, name: 'Wedang Jahe', category: 'Minuman', calories: 35, protein: 0, carbs: 9, fat: 0, fiber: 0, servingSize: 200, unit: 'ml' },
  { id: 84, name: 'Bandrek', category: 'Minuman', calories: 95, protein: 0.5, carbs: 23, fat: 0.2, fiber: 0.1, servingSize: 200, unit: 'ml' },
  { id: 85, name: 'Kopi Hitam', category: 'Minuman', calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, servingSize: 200, unit: 'ml' },
  
  // Snacks
  { id: 90, name: 'Gorengan (5 pcs)', category: 'Snack', calories: 200, protein: 4, carbs: 20, fat: 12, fiber: 1, servingSize: 100, unit: 'gram' },
  { id: 91, name: 'Martabak Manis', category: 'Snack', calories: 286, protein: 5, carbs: 42, fat: 11, fiber: 1, servingSize: 100, unit: 'gram' },
  { id: 92, name: 'Martabak Telur', category: 'Snack', calories: 227, protein: 9, carbs: 24, fat: 10, fiber: 1, servingSize: 100, unit: 'gram' },
  { id: 93, name: 'Bakwan', category: 'Snack', calories: 189, protein: 3, carbs: 18, fat: 12, fiber: 0.5, servingSize: 50, unit: 'gram' },
  { id: 94, name: 'Risoles', category: 'Snack', calories: 175, protein: 4, carbs: 20, fat: 8, fiber: 0.5, servingSize: 50, unit: 'gram' },
  { id: 95, name: 'Pisang Goreng', category: 'Snack', calories: 200, protein: 1.5, carbs: 28, fat: 10, fiber: 2, servingSize: 100, unit: 'gram' },
  { id: 96, name: 'Lumpia', category: 'Snack', calories: 162, protein: 4, carbs: 18, fat: 8, fiber: 1, servingSize: 50, unit: 'gram' },
  { id: 97, name: 'Pastel', category: 'Snack', calories: 185, protein: 3, carbs: 22, fat: 9, fiber: 0.8, servingSize: 50, unit: 'gram' },
  { id: 98, name: 'Tahu Crispy', category: 'Snack', calories: 210, protein: 12, carbs: 10, fat: 15, fiber: 1, servingSize: 50, unit: 'gram' },
  { id: 99, name: 'Keripik Singkong', category: 'Snack', calories: 456, protein: 2.5, carbs: 60, fat: 23, fiber: 3.5, servingSize: 30, unit: 'gram' },
  { id: 100, name: 'Keripik Tempe', category: 'Snack', calories: 465, protein: 18, carbs: 45, fat: 25, fiber: 5, servingSize: 30, unit: 'gram' },
  { id: 101, name: 'Rempeyek', category: 'Snack', calories: 520, protein: 12, carbs: 35, fat: 38, fiber: 2, servingSize: 30, unit: 'gram' },
  { id: 102, name: 'Kue Lapis', category: 'Snack', calories: 265, protein: 3, carbs: 42, fat: 10, fiber: 0.5, servingSize: 50, unit: 'gram' },
  { id: 103, name: 'Bika Ambon', category: 'Snack', calories: 245, protein: 4, carbs: 48, fat: 5, fiber: 0.5, servingSize: 50, unit: 'gram' },
  { id: 104, name: 'Onde-Onde', category: 'Snack', calories: 280, protein: 4, carbs: 38, fat: 12, fiber: 1, servingSize: 50, unit: 'gram' },
  { id: 105, name: 'Klepon', category: 'Snack', calories: 145, protein: 1.5, carbs: 30, fat: 2, fiber: 0.5, servingSize: 30, unit: 'gram' },
  { id: 106, name: 'Lumpia Udang', category: 'Snack', calories: 190, protein: 7, carbs: 20, fat: 9, fiber: 0.8, servingSize: 50, unit: 'gram' },
  { id: 107, name: 'Leker (Crepe)', category: 'Snack', calories: 230, protein: 5, carbs: 30, fat: 10, fiber: 0.5, servingSize: 100, unit: 'gram' },
  
  // Indonesian Traditional Dishes
  { id: 110, name: 'Rendang', category: 'Masakan Tradisional', calories: 250, protein: 22, carbs: 5, fat: 17, fiber: 1.5, servingSize: 100, unit: 'gram' },
  { id: 111, name: 'Sate Ayam', category: 'Masakan Tradisional', calories: 180, protein: 25, carbs: 4, fat: 8, fiber: 0.5, servingSize: 100, unit: 'gram' },
  { id: 112, name: 'Gado-Gado', category: 'Masakan Tradisional', calories: 185, protein: 8, carbs: 15, fat: 11, fiber: 4, servingSize: 200, unit: 'gram' },
  { id: 113, name: 'Soto Ayam', category: 'Masakan Tradisional', calories: 125, protein: 12, carbs: 8, fat: 5, fiber: 1.5, servingSize: 250, unit: 'ml' },
  { id: 114, name: 'Rawon', category: 'Masakan Tradisional', calories: 145, protein: 15, carbs: 7, fat: 6, fiber: 1, servingSize: 250, unit: 'ml' },
  { id: 115, name: 'Bakso', category: 'Masakan Tradisional', calories: 180, protein: 14, carbs: 15, fat: 7, fiber: 0.5, servingSize: 200, unit: 'gram' },
  { id: 116, name: 'Nasi Padang', category: 'Masakan Tradisional', calories: 450, protein: 20, carbs: 55, fat: 15, fiber: 3, servingSize: 300, unit: 'gram' },
  { id: 117, name: 'Pecel', category: 'Masakan Tradisional', calories: 195, protein: 7, carbs: 18, fat: 11, fiber: 4, servingSize: 200, unit: 'gram' },
  { id: 118, name: 'Nasi Uduk', category: 'Masakan Tradisional', calories: 210, protein: 4, carbs: 35, fat: 6, fiber: 0.8, servingSize: 150, unit: 'gram' },
  { id: 119, name: 'Bubur Ayam', category: 'Masakan Tradisional', calories: 165, protein: 12, carbs: 20, fat: 4, fiber: 0.5, servingSize: 250, unit: 'gram' },
  { id: 120, name: 'Ayam Betutu', category: 'Masakan Tradisional', calories: 215, protein: 28, carbs: 2, fat: 11, fiber: 0.5, servingSize: 100, unit: 'gram' },
  { id: 121, name: 'Bebek Goreng', category: 'Masakan Tradisional', calories: 280, protein: 22, carbs: 3, fat: 20, fiber: 0, servingSize: 100, unit: 'gram' },
  { id: 122, name: 'Sate Kambing', category: 'Masakan Tradisional', calories: 210, protein: 24, carbs: 4, fat: 11, fiber: 0.5, servingSize: 100, unit: 'gram' },
  { id: 123, name: 'Empal Gepuk', category: 'Masakan Tradisional', calories: 280, protein: 25, carbs: 5, fat: 18, fiber: 0.5, servingSize: 100, unit: 'gram' },
  { id: 124, name: 'Ikan Bakar Rica', category: 'Masakan Tradisional', calories: 165, protein: 28, carbs: 2, fat: 5, fiber: 0.5, servingSize: 100, unit: 'gram' },
  { id: 125, name: 'Tongseng', category: 'Masakan Tradisional', calories: 245, protein: 22, carbs: 8, fat: 14, fiber: 1.5, servingSize: 150, unit: 'gram' },
  { id: 126, name: 'Gudeg', category: 'Masakan Tradisional', calories: 175, protein: 5, carbs: 32, fat: 4, fiber: 3, servingSize: 150, unit: 'gram' },
  { id: 127, name: 'Pempek', category: 'Masakan Tradisional', calories: 185, protein: 8, carbs: 25, fat: 5, fiber: 0.5, servingSize: 100, unit: 'gram' },
  { id: 128, name: 'Laksa', category: 'Masakan Tradisional', calories: 195, protein: 12, carbs: 22, fat: 7, fiber: 2, servingSize: 250, unit: 'ml' },
  { id: 129, name: 'Nasi Liwet', category: 'Masakan Tradisional', calories: 235, protein: 6, carbs: 40, fat: 5, fiber: 1, servingSize: 200, unit: 'gram' },
  { id: 130, name: 'Ketoprak', category: 'Masakan Tradisional', calories: 195, protein: 9, carbs: 28, fat: 6, fiber: 3, servingSize: 200, unit: 'gram' },
  { id: 131, name: 'Asinan', category: 'Masakan Tradisional', calories: 120, protein: 3, carbs: 22, fat: 2, fiber: 3, servingSize: 150, unit: 'gram' },
  { id: 132, name: 'Rujak Buah', category: 'Masakan Tradisional', calories: 95, protein: 1.5, carbs: 24, fat: 0.5, fiber: 3.5, servingSize: 150, unit: 'gram' },
  { id: 133, name: 'Sayur Asem', category: 'Masakan Tradisional', calories: 55, protein: 2, carbs: 10, fat: 1, fiber: 2.5, servingSize: 200, unit: 'ml' },
  { id: 134, name: 'Tahu Telur', category: 'Masakan Tradisional', calories: 180, protein: 14, carbs: 8, fat: 11, fiber: 1, servingSize: 150, unit: 'gram' },
  { id: 135, name: 'Nasi Kuning Komplit', category: 'Masakan Tradisional', calories: 485, protein: 18, carbs: 55, fat: 20, fiber: 3, servingSize: 350, unit: 'gram' },
  { id: 136, name: 'Nasi Goreng Kampung', category: 'Masakan Tradisional', calories: 250, protein: 8, carbs: 35, fat: 9, fiber: 2, servingSize: 250, unit: 'gram' },
  { id: 137, name: 'Mie Ayam', category: 'Masakan Tradisional', calories: 195, protein: 12, carbs: 25, fat: 5, fiber: 1, servingSize: 200, unit: 'gram' },
  { id: 138, name: 'Kwetiau', category: 'Masakan Tradisional', calories: 200, protein: 10, carbs: 28, fat: 6, fiber: 1.5, servingSize: 200, unit: 'gram' },
  { id: 139, name: 'Bihun Kuah', category: 'Masakan Tradisional', calories: 150, protein: 8, carbs: 22, fat: 3, fiber: 1, servingSize: 200, unit: 'ml' },
  { id: 140, name: 'Soto Betawi', category: 'Masakan Tradisional', calories: 185, protein: 14, carbs: 10, fat: 10, fiber: 1.5, servingSize: 250, unit: 'ml' },
  { id: 141, name: 'Soto Lamongan', category: 'Masakan Tradisional', calories: 145, protein: 13, carbs: 9, fat: 6, fiber: 1.5, servingSize: 250, unit: 'ml' },
  { id: 142, name: 'Sop Buntut', category: 'Masakan Tradisional', calories: 280, protein: 18, carbs: 12, fat: 18, fiber: 1, servingSize: 250, unit: 'ml' },
  { id: 143, name: 'Nasi Jagung', category: 'Masakan Tradisional', calories: 165, protein: 4, carbs: 35, fat: 1.5, fiber: 2.5, servingSize: 150, unit: 'gram' },
  { id: 144, name: 'Timlo', category: 'Masakan Tradisional', calories: 160, protein: 12, carbs: 15, fat: 5, fiber: 1.5, servingSize: 200, unit: 'ml' },
  { id: 145, name: 'Bakmie Jawa', category: 'Masakan Tradisional', calories: 210, protein: 10, carbs: 30, fat: 6, fiber: 1.5, servingSize: 200, unit: 'gram' },
];

const categories = [
  { id: 'all', label: 'Semua', icon: Utensils, color: 'bg-gradient-to-r from-violet-500 to-purple-600' },
  { id: 'Karbohidrat', label: 'Karbohidrat', icon: Wheat, color: 'bg-gradient-to-r from-amber-400 to-orange-500' },
  { id: 'Protein', label: 'Protein', icon: Beef, color: 'bg-gradient-to-r from-rose-500 to-red-600' },
  { id: 'Sayuran', label: 'Sayuran', icon: Salad, color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
  { id: 'Buah', label: 'Buah', icon: Apple, color: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { id: 'Minuman', label: 'Minuman', icon: Droplets, color: 'bg-gradient-to-r from-cyan-500 to-blue-600' },
  { id: 'Snack', label: 'Snack', icon: Flame, color: 'bg-gradient-to-r from-orange-500 to-red-500' },
  { id: 'Masakan Tradisional', label: 'Tradisional', icon: Utensils, color: 'bg-gradient-to-r from-teal-500 to-cyan-600' },
];

interface FoodEntry {
  id: string;
  foodId: number;
  name: string;
  category: string;
  amount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

// Age group configurations
const ageGroups = {
  dewasa: {
    id: 'dewasa',
    label: 'Dewasa',
    description: 'Usia 19+ tahun',
    icon: '🧑',
    targets: {
      calories: 2000,
      protein: 55,
      carbs: 275,
      fat: 67,
      fiber: 28,
    },
  },
  anak: {
    id: 'anak',
    label: 'Anak-anak',
    description: 'Usia 4-8 tahun',
    icon: '👶',
    targets: {
      calories: 1200,
      protein: 25,
      carbs: 150,
      fat: 40,
      fiber: 18,
    },
  },
};

type AgeGroupKey = keyof typeof ageGroups;

// Helper function to format date
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper function to format date for display
const formatDateDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
};

export function AhliGiziPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroupKey>('dewasa');
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedFood, setSelectedFood] = useState<typeof foodDatabase[0] | null>(null);
  const [amount, setAmount] = useState(100);
  
  // Date and history states
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [savedDates, setSavedDates] = useState<{ date: string; dewasa: number; anak: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Get current targets based on age group
  const dailyTargets = ageGroups[selectedAgeGroup].targets;

  // Load saved dates on mount
  useEffect(() => {
    loadSavedDates();
  }, []);

  // Load entries when date or age group changes
  useEffect(() => {
    loadEntriesForDate();
  }, [selectedDate, selectedAgeGroup]);

  const loadSavedDates = async () => {
    try {
      const response = await fetch('/api/food-diary/dates');
      const data = await response.json();
      if (data.success) {
        setSavedDates(data.dates);
      }
    } catch (error) {
      console.error('Error loading saved dates:', error);
    }
  };

  const loadEntriesForDate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/food-diary?date=${selectedDate}&ageGroup=${selectedAgeGroup}`);
      const data = await response.json();
      if (data.success) {
        const entries: FoodEntry[] = data.entries.map((e: Record<string, unknown>) => ({
          id: e.id as string,
          foodId: e.foodId as number,
          name: e.foodName as string,
          category: e.category as string,
          amount: e.amount as number,
          calories: e.calories as number,
          protein: e.protein as number,
          carbs: e.carbs as number,
          fat: e.fat as number,
          fiber: e.fiber as number,
        }));
        setFoodEntries(entries);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntryToDatabase = async (entry: FoodEntry) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/food-diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          ageGroup: selectedAgeGroup,
          foodId: entry.foodId,
          foodName: entry.name,
          category: entry.category,
          amount: entry.amount,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
          fiber: entry.fiber,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Update the entry with the database ID
        setFoodEntries(prev => prev.map(e => 
          e.id === entry.id ? { ...e, id: data.entry.id } : e
        ));
        loadSavedDates();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Gagal menyimpan makanan');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntryFromDatabase = async (id: string) => {
    try {
      const response = await fetch(`/api/food-diary/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      loadSavedDates();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Gagal menghapus makanan');
    }
  };

  const clearAllFromDatabase = async () => {
    try {
      const response = await fetch(`/api/food-diary?date=${selectedDate}&ageGroup=${selectedAgeGroup}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      loadSavedDates();
    } catch (error) {
      console.error('Error clearing entries:', error);
      toast.error('Gagal menghapus semua makanan');
    }
  };

  // Navigation functions
  const goToPreviousDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(formatDate(current));
  };

  const goToNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(formatDate(current));
  };

  const goToToday = () => {
    setSelectedDate(formatDate(new Date()));
  };

  // Filter foods based on search and category
  const filteredFoods = useMemo(() => {
    return foodDatabase.filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Calculate totals
  const totals = useMemo(() => {
    return foodEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
        fiber: acc.fiber + entry.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  }, [foodEntries]);

  const handleAddFood = async () => {
    if (!selectedFood) return;

    const multiplier = amount / 100;
    const newEntry: FoodEntry = {
      id: `temp-${Date.now()}`,
      foodId: selectedFood.id,
      name: selectedFood.name,
      category: selectedFood.category,
      amount: amount,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
      fat: Math.round(selectedFood.fat * multiplier * 10) / 10,
      fiber: Math.round(selectedFood.fiber * multiplier * 10) / 10,
    };

    setFoodEntries([...foodEntries, newEntry]);
    setShowAddDialog(false);
    setSelectedFood(null);
    setAmount(100);
    
    // Save to database
    await saveEntryToDatabase(newEntry);
    toast.success(`${selectedFood.name} ditambahkan ke daftar`);
  };

  const handleRemoveEntry = async (id: string) => {
    setFoodEntries(foodEntries.filter(entry => entry.id !== id));
    await deleteEntryFromDatabase(id);
    toast.success('Makanan dihapus dari daftar');
  };

  const handleClearAll = async () => {
    setFoodEntries([]);
    await clearAllFromDatabase();
    toast.success('Semua daftar makanan dihapus');
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const openAddDialog = (food: typeof foodDatabase[0]) => {
    setSelectedFood(food);
    setAmount(food.servingSize);
    setShowAddDialog(true);
  };

  // Check if a date has entries
  const hasEntriesOnDate = (dateStr: string, ageGroup: AgeGroupKey): boolean => {
    const dateInfo = savedDates.find(d => d.date === dateStr);
    if (!dateInfo) return false;
    return ageGroup === 'dewasa' ? dateInfo.dewasa > 0 : dateInfo.anak > 0;
  };

  const isToday = selectedDate === formatDate(new Date());

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Salad className="w-5 h-5 text-white" />
            </div>
            Ahli Gizi
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Kalkulator nutrisi untuk menghitung gizi makanan harian Anda
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-lg border-2 border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              size="lg"
              onClick={goToPreviousDay}
              className="rounded-xl h-10 w-10 p-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 px-3">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-0 bg-transparent font-semibold text-base w-36"
              />
            </div>
            <Button
              variant="ghost"
              size="lg"
              onClick={goToNextDay}
              className="rounded-xl h-10 w-10 p-0"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            {!isToday && (
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="rounded-xl text-xs"
              >
                Hari Ini
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Date Display & Age Group Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Date Info */}
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/30 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">{formatDateDisplay(selectedDate)}</span>
          </div>
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />}
        </motion.div>

        {/* Age Group Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-lg border-2 border-slate-200 dark:border-slate-700">
          {(Object.keys(ageGroups) as AgeGroupKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedAgeGroup(key)}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                selectedAgeGroup === key
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-base">{ageGroups[key].icon}</span>
              <span>{ageGroups[key].label}</span>
            </button>
          ))}
          {/* History Button */}
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setShowHistory(!showHistory)}
            className={`rounded-xl ${showHistory ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
            title="Riwayat"
          >
            <History className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Age Group Info Banner */}
      <motion.div
        key={selectedAgeGroup}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 rounded-2xl p-4 border-2 border-emerald-200 dark:border-emerald-800/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{ageGroups[selectedAgeGroup].icon}</span>
            <div>
              <h3 className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
                Kategori: {ageGroups[selectedAgeGroup].label}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {ageGroups[selectedAgeGroup].description} • Target harian: {dailyTargets.calories} kkal, {dailyTargets.protein}g protein
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Target className="w-4 h-4" />
            Target: {dailyTargets.calories} kkal
          </div>
        </div>
      </motion.div>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="shadow-xl border-2 border-slate-200/50 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-base">
                  <History className="w-4 h-4 text-emerald-500" />
                  Riwayat Pencatatan
                </CardTitle>
                <CardDescription>
                  Klik tanggal untuk melihat catatan makanan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedDates.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">Belum ada riwayat pencatatan</p>
                ) : (
                  <ScrollArea className="h-[150px]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {savedDates.slice(0, 12).map((item) => (
                        <button
                          key={item.date}
                          onClick={() => {
                            setSelectedDate(item.date);
                            setShowHistory(false);
                          }}
                          className={`p-3 rounded-xl text-left transition-all ${
                            selectedDate === item.date
                              ? 'bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-500'
                              : 'bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border-2 border-transparent'
                          }`}
                        >
                          <p className="font-medium text-xs text-slate-800 dark:text-white">
                            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </p>
                          <div className="flex gap-2 mt-1 text-xs text-slate-500">
                            {item.dewasa > 0 && <span>🧑 {item.dewasa}</span>}
                            {item.anak > 0 && <span>👶 {item.anak}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Kalori', value: totals.calories, unit: 'kkal', target: dailyTargets.calories, icon: Flame, gradient: 'from-orange-400 via-red-500 to-rose-600', bgLight: 'bg-orange-50', bgDark: 'dark:bg-orange-950/30' },
          { label: 'Protein', value: totals.protein, unit: 'g', target: dailyTargets.protein, icon: Beef, gradient: 'from-rose-400 via-pink-500 to-fuchsia-600', bgLight: 'bg-rose-50', bgDark: 'dark:bg-rose-950/30' },
          { label: 'Karbohidrat', value: totals.carbs, unit: 'g', target: dailyTargets.carbs, icon: Wheat, gradient: 'from-amber-400 via-yellow-500 to-orange-500', bgLight: 'bg-amber-50', bgDark: 'dark:bg-amber-950/30' },
          { label: 'Lemak', value: totals.fat, unit: 'g', target: dailyTargets.fat, icon: Droplets, gradient: 'from-cyan-400 via-blue-500 to-indigo-600', bgLight: 'bg-cyan-50', bgDark: 'dark:bg-cyan-950/30' },
          { label: 'Serat', value: totals.fiber, unit: 'g', target: dailyTargets.fiber, icon: Salad, gradient: 'from-green-400 via-emerald-500 to-teal-600', bgLight: 'bg-green-50', bgDark: 'dark:bg-green-950/30' },
        ].map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${item.bgLight} ${item.bgDark} rounded-xl p-3 shadow-lg border border-white/80 dark:border-slate-700/50`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-800 dark:text-white">{item.value}</span>
              <span className="text-sm text-slate-500 font-medium">{item.unit}</span>
            </div>
            <div className="mt-3">
              <Progress 
                value={getProgressPercentage(item.value, item.target)} 
                className="h-2.5"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {Math.round((item.value / item.target) * 100)}% dari target
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Food Database */}
        <div className="lg:col-span-2">
          <Card className="h-full shadow-xl border-2 border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  <Apple className="w-4 h-4 text-white" />
                </div>
                Database Makanan
              </CardTitle>
              <CardDescription className="text-sm">
                Pilih makanan untuk ditambahkan ke daftar konsumsi harian
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Cari makanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm rounded-lg"
                />
              </div>

              {/* Category Filter */}
              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`whitespace-nowrap h-8 px-3 text-xs font-medium rounded-lg transition-all ${
                        selectedCategory === cat.id 
                          ? `${cat.color} text-white shadow-lg hover:opacity-90` 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <cat.icon className="w-3.5 h-3.5 mr-1.5" />
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </ScrollArea>

              {/* Food List */}
              <ScrollArea className="h-[360px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2">
                  {filteredFoods.map((food) => (
                    <motion.div
                      key={food.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/80 dark:to-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer"
                      onClick={() => openAddDialog(food)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-white">{food.name}</h4>
                          <Badge variant="secondary" className="mt-1 text-xs px-2 py-0.5 rounded-md">
                            {food.category}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg h-7 w-7"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {food.calories} kkal
                        </span>
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/30 rounded">
                          <Beef className="w-3 h-3 text-rose-500" />
                          {food.protein}g
                        </span>
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded">
                          <Wheat className="w-3 h-3 text-amber-500" />
                          {food.carbs}g
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Daily Intake */}
        <div className="lg:col-span-1">
          <Card className="h-full shadow-xl border-2 border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
                    <Calculator className="w-4 h-4 text-white" />
                  </div>
                  Konsumsi
                </CardTitle>
                {foodEntries.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <CardDescription className="text-sm">
                {foodEntries.length} item makanan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {foodEntries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-4">
                    <Utensils className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Belum ada makanan
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Klik makanan dari database untuk menambahkan
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3 pr-2">
                    <AnimatePresence>
                      {foodEntries.map((entry) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/80 dark:to-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-slate-800 dark:text-white">{entry.name}</h4>
                              <p className="text-xs text-slate-500 font-medium">{entry.amount}g</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveEntry(entry.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <Badge className="text-xs px-2 py-0.5 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 dark:from-orange-900/50 dark:to-amber-900/50 dark:text-orange-300 border-0">
                              {entry.calories} kkal
                            </Badge>
                            <Badge className="text-xs px-2 py-0.5 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 dark:from-rose-900/50 dark:to-pink-900/50 dark:text-rose-300 border-0">
                              P: {entry.protein}g
                            </Badge>
                            <Badge className="text-xs px-2 py-0.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/50 dark:to-yellow-900/50 dark:text-amber-300 border-0">
                              K: {entry.carbs}g
                            </Badge>
                            <Badge className="text-xs px-2 py-0.5 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 dark:from-cyan-900/50 dark:to-blue-900/50 dark:text-cyan-300 border-0">
                              L: {entry.fat}g
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              )}

              {/* Total Summary */}
              {foodEntries.length > 0 && (
                <div className="mt-4 p-3 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                  <h4 className="font-semibold text-sm text-emerald-700 dark:text-emerald-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Total Nutrisi
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Kalori:</span>
                      <span className="font-bold text-slate-800 dark:text-white text-sm">{totals.calories} kkal</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Protein:</span>
                      <span className="font-bold text-slate-800 dark:text-white text-sm">{totals.protein}g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Karbohidrat:</span>
                      <span className="font-bold text-slate-800 dark:text-white text-sm">{totals.carbs}g</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Lemak:</span>
                      <span className="font-bold text-slate-800 dark:text-white text-sm">{totals.fat}g</span>
                    </div>
                    <div className="flex justify-between items-center col-span-2">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Serat:</span>
                      <span className="font-bold text-slate-800 dark:text-white text-sm">{totals.fiber}g</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Nutrition Tips */}
      <Card className="shadow-xl border-2 border-slate-200/50 dark:border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            Tips Gizi {selectedAgeGroup === 'dewasa' ? 'Dewasa' : 'Anak-anak (4-8 tahun)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedAgeGroup === 'dewasa' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-50 via-red-50 to-rose-50 dark:from-orange-950/30 dark:via-red-950/30 dark:to-rose-950/30 rounded-xl border border-orange-200 dark:border-orange-800/30">
                <h4 className="font-semibold text-sm text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  Kalori
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Kebutuhan kalori rata-rata orang dewasa adalah 2000-2500 kkal per hari, tergantung aktivitas dan usia.
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-950/30 dark:via-pink-950/30 dark:to-fuchsia-950/30 rounded-xl border border-rose-200 dark:border-rose-800/30">
                <h4 className="font-semibold text-sm text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <Beef className="w-4 h-4" />
                  Protein
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Protein penting untuk membangun dan memperbaiki jaringan tubuh. Kebutuhan harian sekitar 0.8g per kg berat badan.
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-green-200 dark:border-green-800/30">
                <h4 className="font-semibold text-sm text-green-700 dark:text-green-300 flex items-center gap-1.5">
                  <Salad className="w-4 h-4" />
                  Serat
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Serat membantu pencernaan dan menjaga kesehatan usus. Konsumsi 25-30g serat per hari dari sayuran dan buah.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-yellow-950/30 rounded-xl border border-orange-200 dark:border-orange-800/30">
                <h4 className="font-semibold text-sm text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  Kalori Anak
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Anak usia 4-8 tahun membutuhkan 1200-1400 kkal per hari untuk mendukung pertumbuhan dan aktivitas bermain.
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-950/30 dark:via-pink-950/30 dark:to-fuchsia-950/30 rounded-xl border border-rose-200 dark:border-rose-800/30">
                <h4 className="font-semibold text-sm text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <Beef className="w-4 h-4" />
                  Protein Tumbuh
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Protein sangat penting untuk pertumbuhan anak. Berikan 19-25g protein per hari dari telur, ikan, dan susu.
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-green-200 dark:border-green-800/30">
                <h4 className="font-semibold text-sm text-green-700 dark:text-green-300 flex items-center gap-1.5">
                  <Apple className="w-4 h-4" />
                  Sayur & Buah
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Ajarkan anak makan sayur dan buah sejak dini. Target 17-20g serat per hari untuk pencernaan yang sehat.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Food Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Tambah Makanan</DialogTitle>
            <DialogDescription className="text-sm">
              Atur porsi makanan yang akan ditambahkan
            </DialogDescription>
          </DialogHeader>
          {selectedFood && (
            <div className="space-y-4">
              <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl">
                <h4 className="font-semibold text-sm text-slate-800 dark:text-white">{selectedFood.name}</h4>
                <Badge variant="secondary" className="mt-1 text-xs px-2 py-0.5">{selectedFood.category}</Badge>
                <div className="flex flex-wrap gap-2 mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded">{selectedFood.calories} kkal/100g</span>
                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded">P: {selectedFood.protein}g</span>
                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded">K: {selectedFood.carbs}g</span>
                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded">L: {selectedFood.fat}g</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Jumlah (gram)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(Math.max(10, amount - 10))}
                    className="rounded-lg h-9 w-9"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="text-center text-sm font-medium h-9 rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amount + 10)}
                    className="rounded-lg h-9 w-9"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {[50, 100, 150, 200, 250].map((val) => (
                    <Button
                      key={val}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(val)}
                      className={`rounded-lg text-xs font-medium ${amount === val ? 'bg-emerald-100 dark:bg-emerald-900 border-emerald-400 border' : ''}`}
                    >
                      {val}g
                    </Button>
                  ))}
                </div>
              </div>

              {/* Calculated values */}
              <div className="p-3 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                <h5 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-3">Nutrisi untuk {amount}g:</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Kalori:</span>
                    <span className="font-bold">{Math.round(selectedFood.calories * amount / 100)} kkal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Protein:</span>
                    <span className="font-bold">{(selectedFood.protein * amount / 100).toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Karbo:</span>
                    <span className="font-bold">{(selectedFood.carbs * amount / 100).toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Lemak:</span>
                    <span className="font-bold">{(selectedFood.fat * amount / 100).toFixed(1)}g</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-3">
            <Button variant="outline" size="lg" onClick={() => setShowAddDialog(false)} className="rounded-xl">
              Batal
            </Button>
            <Button size="lg" onClick={handleAddFood} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-lg shadow-emerald-500/30">
              <Plus className="w-5 h-5 mr-2" />
              Tambahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

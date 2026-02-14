import { motion } from 'framer-motion';
import type { CalendarCategory } from '../types/calendar.types';
import { Check } from 'lucide-react';

interface CategoryFilterProps {
    categories: CalendarCategory[];
    onToggle: (categoryId: string) => void;
}

const CategoryFilter = ({ categories, onToggle }: CategoryFilterProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
        >
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Other
            </h4>
            {categories.map((category, index) => (
                <motion.button
                    key={category.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    onClick={() => onToggle(category.id)}
                    className={`
            flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all
            ${category.isVisible
                            ? 'bg-accent/50 text-foreground'
                            : 'text-muted-foreground hover:bg-accent/30'}
          `}
                    style={{
                        backgroundColor: category.isVisible ? `${category.color}20` : undefined,
                    }}
                >
                    <div
                        className={`
              h-5 w-5 rounded flex items-center justify-center transition-colors
            `}
                        style={{
                            backgroundColor: category.isVisible ? category.color : 'transparent',
                            border: category.isVisible ? 'none' : `2px solid ${category.color}`,
                        }}
                    >
                        {category.isVisible && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="font-medium">{category.name}</span>
                </motion.button>
            ))}
        </motion.div>
    );
};

export default CategoryFilter;

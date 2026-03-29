'use client'

import { motion } from 'motion/react'
import type { Opportunity, OpportunityType } from '@/lib/types'
import { typeColors } from '@/lib/type-colors'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Calendar, DollarSign, Building2, Globe } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
}

type Props = {
  opportunity: Opportunity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HackDrawer({ opportunity, open, onOpenChange }: Props) {
  if (!opportunity) return null

  const colors = typeColors[opportunity.type as OpportunityType]
  const reward = opportunity.reward_amount
    ? `$${Number(opportunity.reward_amount).toLocaleString()}`
    : null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-lg rounded-t-2xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="px-6 pb-6"
        >
          <motion.div variants={itemVariants}>
            <DrawerHeader className="px-0 pb-4">
              <div className="flex items-center gap-2 mb-2">
                {colors && (
                  <Badge className={`${colors.bg} ${colors.text} text-[10px] px-2 py-0.5`}>
                    {opportunity.type}
                  </Badge>
                )}
                {opportunity.status && (
                  <Badge className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5">
                    {opportunity.status}
                  </Badge>
                )}
              </div>
              <DrawerTitle className="text-xl font-semibold tracking-tight text-gray-900">
                {opportunity.name}
              </DrawerTitle>
              {opportunity.description && (
                <DrawerDescription className="text-sm text-gray-400 leading-relaxed mt-1">
                  {opportunity.description.slice(0, 200)}
                  {opportunity.description.length > 200 ? '...' : ''}
                </DrawerDescription>
              )}
            </DrawerHeader>
          </motion.div>

          {/* Stats grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-4">
            {reward && (
              <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mb-0.5">
                  <DollarSign className="size-3" /> Reward
                </div>
                <p className="text-lg font-semibold text-gray-900 tabular-nums">{reward}</p>
                {opportunity.reward_token && (
                  <p className="text-[10px] text-gray-400">{opportunity.reward_token}</p>
                )}
              </div>
            )}
            {opportunity.organization && (
              <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mb-0.5">
                  <Building2 className="size-3" /> Organization
                </div>
                <p className="text-sm font-medium text-gray-900">{opportunity.organization}</p>
              </div>
            )}
            {(opportunity.start_date || opportunity.end_date) && (
              <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mb-0.5">
                  <Calendar className="size-3" /> Dates
                </div>
                <p className="text-xs text-gray-700">
                  {opportunity.start_date ?? '?'} → {opportunity.end_date ?? '?'}
                </p>
              </div>
            )}
            {opportunity.format && (
              <div className="rounded-lg bg-gray-50 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mb-0.5">
                  <Globe className="size-3" /> Format
                </div>
                <p className="text-sm font-medium text-gray-900 capitalize">{opportunity.format}</p>
              </div>
            )}
          </motion.div>

          {/* Blockchains */}
          {opportunity.blockchains?.length > 0 && (
            <motion.div variants={itemVariants} className="flex flex-wrap gap-1.5 mb-4">
              {opportunity.blockchains.map((chain) => (
                <Badge key={chain} className="bg-gray-100 text-gray-600 text-[10px]">{chain}</Badge>
              ))}
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <DrawerFooter className="px-0 pt-2 flex-row gap-2">
              {opportunity.website_url && (
                <a
                  href={opportunity.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 text-white text-sm font-medium h-10 hover:bg-gray-800 transition-colors"
                >
                  Visit <ExternalLink className="size-3.5" />
                </a>
              )}
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1 rounded-xl h-10">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </motion.div>
        </motion.div>
      </DrawerContent>
    </Drawer>
  )
}

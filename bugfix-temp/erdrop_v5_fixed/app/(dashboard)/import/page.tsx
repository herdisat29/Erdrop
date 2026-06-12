import { ImportWizard } from '@/components/projects/ImportWizard'

export const dynamic = 'force-dynamic'

export default function ImportPage() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 mb-2">Import Data</h2>
        <p className="text-zinc-600 dark:text-zinc-400">Pindahkan data farming kamu dari Excel atau Google Sheets ke Erdrop dalam hitungan detik.</p>
      </div>

      <ImportWizard />
    </div>
  )
}

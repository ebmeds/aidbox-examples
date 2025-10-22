import { getCurrentAidbox } from "@/lib/server/smart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { PageSizeSelect } from "@/components/page-size-select";
import { Pager } from "@/components/pager";
import { Bundle, ActivityDefinition } from "fhir/r4";
import { isDefined } from "@/lib/utils";
import { decidePageSize } from "@/lib/server/utils";
import Markdown from 'react-markdown'


interface PageProps {
  searchParams: Promise<{
    page?: string;
    name?: string;
    gender?: "male" | "female" | "other" | "unknown";
    pageSize?: string;
  }>;
}

export default async function PractitionersPage({ searchParams }: PageProps) {
  const aidbox = await getCurrentAidbox();
  const params = await searchParams;

  const pageSize = await decidePageSize(params.pageSize);
  const page = Number(params.page) || 1;

  const response = await aidbox
    .get("fhir/ActivityDefinition", {
      searchParams: {
        _count: pageSize,
        _page: page,
      },
    })
    .json<Bundle<ActivityDefinition>>();

  const resources =
    response.entry?.map((entry) => entry.resource)?.filter(isDefined) || [];

  const total = response.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <PageHeader
        items={[{ href: "/", label: "Home" }, { label: "Activity definitions" }]}
      />
      <div className="flex-1 p-6">
        {/* <div className="flex gap-2 mb-6">
          <form className="flex-1 flex gap-2" action="/practitioners">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div> */}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">ID</TableHead>
                <TableHead>Topic</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.filter(({ topic }) => topic).map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="pl-6">{resource.id}</TableCell>
                  <TableCell className="pl-6"><Markdown>{resource.topic ? resource.topic[0].text : 'No topic'}</Markdown></TableCell>
                </TableRow>
              ))}
              {!resources.length && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No activity definitions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex items-center gap-4">
            {total ? (
              <div className="text-sm text-muted-foreground">{`Showing ${(page - 1) * pageSize + 1
                }-${Math.min(
                  page * pageSize,
                  total,
                )} of ${total} practitioners`}</div>
            ) : null}
            <PageSizeSelect currentSize={pageSize} />
          </div>
          <Pager currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}

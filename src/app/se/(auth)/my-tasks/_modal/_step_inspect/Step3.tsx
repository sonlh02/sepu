import { InspectType } from "@/enum/inspect_type"
import { InspectData } from "../../doc_data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface InspectionFormProps {
  id?: string
  className?: string
  inspectData: InspectData
  action?: (formData: FormData) => void
  readOnly?: boolean
}

export function InspectionForm({ id, className, inspectData, action, readOnly = false }: InspectionFormProps) {
  const FormWrapper = readOnly ? 'div' : 'form'

  return (
    <FormWrapper id={id} className={`space-y-8 ${className || ""}`} action={action}>
      <Card>
        <CardHeader>
          <CardTitle>1. Nội dung kiểm tra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {inspectData.type === InspectType.Night ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="heat_coupling">Hiện tượng phát nhiệt các mối nói</Label>
                <Textarea
                  id="heat_coupling"
                  name="1_1"
                  defaultValue={inspectData.results.heat_coupling}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discharge">Hiện tượng phóng điện ở đường dây, chuỗi cách điện</Label>
                <Textarea
                  id="discharge"
                  name="1_2"
                  defaultValue={inspectData.results.discharge}
                  readOnly={readOnly}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="corridor">Hành lang tuyến</Label>
                <Textarea
                  id="corridor"
                  name="1_1"
                  defaultValue={inspectData.results.corridor}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="steel_col">Cột</Label>
                <Textarea
                  id="steel_col"
                  name="1_2"
                  defaultValue={inspectData.results.steel_col}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="col_foundation">Móng cột</Label>
                <Textarea
                  id="col_foundation"
                  name="1_3"
                  defaultValue={inspectData.results.col_foundation}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="structure">Các kết cấu xà và giá đỡ</Label>
                <Textarea
                  id="structure"
                  name="1_4"
                  defaultValue={inspectData.results.structure}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insulate">Sứ cách điện</Label>
                <Textarea
                  id="insulate"
                  name="1_5"
                  defaultValue={inspectData.results.insulate}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="electric_wire">Dây dẫn</Label>
                <Textarea
                  id="electric_wire"
                  name="1_6"
                  defaultValue={inspectData.results.electric_wire}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="earthing">Các kết cấu tiếp địa, tình trang tiếp địa</Label>
                <Textarea
                  id="earthing"
                  name="1_7"
                  defaultValue={inspectData.results.earthing}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="holding_rope">Dây néo, móng néo</Label>
                <Textarea
                  id="holding_rope"
                  name="1_8"
                  defaultValue={inspectData.results.holding_rope}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anti_lightning">Các thiết bị chống sét</Label>
                <Textarea
                  id="anti_lightning"
                  name="1_9"
                  defaultValue={inspectData.results.anti_lightning}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anti_vibration">Tạ bù, tạ chóng rung</Label>
                <Textarea
                  id="anti_vibration"
                  name="1_10"
                  defaultValue={inspectData.results.anti_vibration}
                  readOnly={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heat_coupling">Phát nhiệt mối nối</Label>
                <Textarea
                  id="heat_coupling"
                  name="1_11"
                  defaultValue={inspectData.results.heat_coupling}
                  readOnly={readOnly}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {inspectData.type === InspectType.Night
              ? "2. Các hiện tượng bất thường khác"
              : "2. Các tồn tại đã xử lý ngay trong kiểm tra"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="2"
            defaultValue={inspectData.type === InspectType.Night ? inspectData.results.other : inspectData.results.processed}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Các kiến nghị sau kiểm tra</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="3"
            defaultValue={inspectData.results.suggest}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>
    </FormWrapper>
  )
}

export function NStep3(props: InspectionFormProps) {
  return <InspectionForm {...props} />
}

export function VStep3(props: Omit<InspectionFormProps, 'action'>) {
  return <InspectionForm {...props} readOnly />
}
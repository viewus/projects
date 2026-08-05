/* ---------------------------------------------------------------------------
 * tableRenderer.js — same pattern as cardRenderer: variant map + one function.
 * Rows arrive as arrays of cell values; the first row of `columns` is the head.
 * ------------------------------------------------------------------------- */
(function (window) {
  "use strict";

  var tableVariantFiles = {
    striped:  "components/tables/tableStriped.html",
    bordered: "components/tables/tableBordered.html",
    compact:  "components/tables/tableCompact.html"
  };

  function headHtml(columns) {
    return (columns || []).map(function (col) {
      return '<th scope="col" class="dataTableHead">' + pjEscape(col) + "</th>";
    }).join("");
  }

  function bodyHtml(rows) {
    return (rows || []).map(function (row) {
      var cells = row.map(function (cell, index) {
        // First cell of each row is the row header — better for screen readers
        // than a grid of anonymous <td>s.
        return index === 0
          ? '<th scope="row" class="dataTableRowHead">' + cell + "</th>"
          : '<td class="dataTableCell">' + cell + "</td>";
      }).join("");
      return "<tr>" + cells + "</tr>";
    }).join("");
  }

  /**
   * @param {{caption?:string, columns:string[], rows:Array<string[]>}} table
   *        Row cell values may contain markup (links, <strong>) — they are
   *        authored in JS by the page, not by an untrusted source.
   */
  function renderTable(table, variant) {
    var chosen = variant || table.variant || "striped";
    var file = tableVariantFiles[chosen] || tableVariantFiles.striped;

    return pjRender(file, {
      caption: table.caption || "",
      headHtml: headHtml(table.columns),
      bodyHtml: bodyHtml(table.rows)
    });
  }

  window.tableVariantFiles = tableVariantFiles;
  window.renderTable = renderTable;

})(window);

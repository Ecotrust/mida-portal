from pathlib import Path

from django.test import SimpleTestCase


class OceanStoryContentLegendTest(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        template_path = (
            Path(__file__).resolve().parents[1]
            / "templates"
            / "ocean_stories"
            / "content.html"
        )
        cls.template = template_path.read_text()

    def test_legend_row_requires_valid_label_or_visualization(self):
        self.assertIn(
            "var has_label = label !== undefined && label !== null && label !== '';",
            self.template,
        )
        self.assertIn("var has_viz = viz !== '';", self.template)
        self.assertIn(
            "if (has_label || has_viz) {",
            self.template,
        )

    def test_label_is_only_rendered_when_valid(self):
        expected_branch = '''if (has_label) {
                                                                    html += "<td>" + label + "</td>";
                                                                }'''

        self.assertIn(expected_branch, self.template)

    def test_visualization_is_only_rendered_when_valid(self):
        expected_branch = '''if (has_viz) {
                                                                    html += "<td>" + viz + "</td>";
                                                                }'''

        self.assertIn(expected_branch, self.template)

    def test_invalid_label_and_visualization_do_not_create_a_row(self):
        condition_start = self.template.index(
            "var has_label = label !== undefined && label !== null && label !== '';"
        )
        row_condition = self.template.index(
            "if (has_label || has_viz) {", condition_start
        )
        row_end = self.template.index("html += \"</tr>\";", row_condition)
        legend_row_code = self.template[row_condition : row_end]

        self.assertNotIn(
            "html += \"<tr valign='middle'>\";",
            self.template[condition_start:row_condition],
        )
        self.assertIn("if (has_label || has_viz)", legend_row_code)

    def test_url_legend_renders_unavailable_when_label_and_url_missing(self):
        self.assertIn(
            "if (entry.url === undefined && entry.label === undefined)",
            self.template,
        )
        self.assertIn("<em>Legend not available</em>", self.template)

    def test_url_legend_renders_image_when_label_missing(self):
        self.assertIn("} else if (entry.label === undefined)", self.template)
        self.assertIn(
            'url + "/" + layer_id + "/images/" + entry.url',
            self.template,
        )

    def test_url_legend_renders_label_when_url_missing(self):
        self.assertIn("} else if (entry.url === undefined)", self.template)
        self.assertIn('html += "<td>" + entry.label + "</td>";', self.template)

    def test_url_legend_renders_image_and_label_when_both_present(self):
        both_values_branch = self.template[self.template.index(
            "} else {\n                                                                html += \"<tr valign='middle'>\";"
        ):]

        self.assertIn(
            'html += "<td><img src=\\\"" + url + "/" + layer_id + "/images/" + entry.url + "\\\"></td>";',
            both_values_branch,
        )
        self.assertIn('html += "<td>" + entry.label + "</td>";', both_values_branch)
